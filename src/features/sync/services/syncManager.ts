import {
  SYNC_AUTO_FLUSH_DELAY_MS,
  SYNC_QUEUE_BATCH_SIZE,
  SYNC_MAX_ATTEMPTS,
} from '@config/constants';
import type {UniqueId} from '@app-types/common';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import type {ConnectivityService} from '@services/network/connectivity';
import {toISODateString} from '@utils/date';
import {reportError, toSyncUserMessage} from '@utils/errors';
import {
  AppState,
  type AppStateStatus,
  type NativeEventSubscription,
} from 'react-native';

import type {SyncEngine, SyncQueueRepository} from '../types';
import {reconcileRemoteTasks} from './reconcileTasks';
import {buildAttemptTracker, resolvePushOperation} from './syncPush';

export interface SyncCycleResult {
  pushed: number;
  pulled: number;
  failed: number;
  skipped: number;
  pendingCount: number;
}

export interface SyncManagerHooks {
  onSyncStarted?: () => void;
  onSyncFinished?: (result: SyncCycleResult) => void;
  onSyncError?: (message: string) => void;
  onTasksMutated?: () => void;
}

export interface SyncManagerDependencies {
  taskRepository: TaskRepository;
  syncQueueRepository: SyncQueueRepository;
  remoteDataSource: TaskRemoteDataSource;
  connectivity: ConnectivityService;
  getUserId: () => UniqueId | null;
  hooks?: SyncManagerHooks;
  maxAttempts?: number;
  batchSize?: number;
  /** Override debounce window (tests). */
  autoFlushDelayMs?: number;
}

/**
 * Offline-to-online synchronization orchestrator.
 *
 * LOCAL MUTATION (already handled by repositories)
 * → SQLite + syncStatus + sync_queue
 * → UI reads SQLite/Redux cache immediately
 *
 * THIS MANAGER
 * → waits for connectivity
 * → push pending dirty tasks (idempotent upsert/delete)
 * → pull remote tasks
 * → reconcile with LWW(updatedAt) without wiping local dirty rows
 * → mark synchronized / record attempts
 *
 * Concurrent flush() calls share one in-flight promise (no parallel runs).
 */
export class SyncManager implements SyncEngine {
  private readonly taskRepository: TaskRepository;
  private readonly syncQueueRepository: SyncQueueRepository;
  private readonly remoteDataSource: TaskRemoteDataSource;
  private readonly connectivity: ConnectivityService;
  private readonly getUserId: () => UniqueId | null;
  private readonly hooks: SyncManagerHooks;
  private readonly maxAttempts: number;
  private readonly batchSize: number;
  private readonly autoFlushDelayMs: number;

  private started = false;
  private stopNetwork: (() => void) | null = null;
  private appStateSubscription: NativeEventSubscription | null = null;
  private lastStatus: 'online' | 'offline' | 'unknown' = 'unknown';
  private lastAppState: AppStateStatus = 'active';
  private inflight: Promise<SyncCycleResult> | null = null;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(deps: SyncManagerDependencies) {
    this.taskRepository = deps.taskRepository;
    this.syncQueueRepository = deps.syncQueueRepository;
    this.remoteDataSource = deps.remoteDataSource;
    this.connectivity = deps.connectivity;
    this.getUserId = deps.getUserId;
    this.hooks = deps.hooks ?? {};
    this.maxAttempts = deps.maxAttempts ?? SYNC_MAX_ATTEMPTS;
    this.batchSize = deps.batchSize ?? SYNC_QUEUE_BATCH_SIZE;
    this.autoFlushDelayMs = deps.autoFlushDelayMs ?? SYNC_AUTO_FLUSH_DELAY_MS;
  }

  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    this.started = true;
    const snapshot = await this.connectivity.getStatus();
    this.lastStatus = snapshot.status;

    this.stopNetwork = this.connectivity.subscribe(next => {
      const wasOffline =
        this.lastStatus === 'offline' || this.lastStatus === 'unknown';
      this.lastStatus = next.status;

      if (wasOffline && next.status === 'online') {
        // Immediate flush on reconnect — pending outbox should leave ASAP.
        this.flush().catch(error => {
          reportError('sync/network-transition', error);
        });
      }
    });

    this.lastAppState = (AppState.currentState as AppStateStatus) || 'active';
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );

    if (snapshot.status === 'online') {
      await this.flush();
    }
  }

  async stop(): Promise<void> {
    this.started = false;
    this.clearScheduledFlush();
    this.stopNetwork?.();
    this.stopNetwork = null;
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;

    if (this.inflight) {
      try {
        await this.inflight;
      } catch {
        // Swallow — shutdown should not throw on a failed cycle.
      }
    }
  }

  /**
   * Debounced flush for local mutations / foreground resume.
   * No-ops while offline; reconnect path calls flush() directly.
   */
  scheduleFlush(): void {
    if (!this.started) {
      return;
    }

    this.clearScheduledFlush();
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush().catch(error => {
        reportError('sync/scheduled-flush', error);
      });
    }, this.autoFlushDelayMs);
  }

  /**
   * Runs one sync cycle. Concurrent callers await the same promise.
   */
  async flush(): Promise<void> {
    this.clearScheduledFlush();
    await this.flushWithResult();
  }

  async flushWithResult(): Promise<SyncCycleResult> {
    if (this.inflight) {
      return this.inflight;
    }

    this.inflight = this.runCycle().finally(() => {
      this.inflight = null;
    });

    return this.inflight;
  }

  /** Test/helper: whether a cycle is currently running. */
  isRunning(): boolean {
    return this.inflight !== null;
  }

  private handleAppStateChange = (nextState: AppStateStatus): void => {
    const wasBackgrounded =
      this.lastAppState === 'background' || this.lastAppState === 'inactive';
    this.lastAppState = nextState;

    if (
      wasBackgrounded &&
      nextState === 'active' &&
      this.lastStatus === 'online'
    ) {
      this.scheduleFlush();
    }
  };

  private clearScheduledFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async runCycle(): Promise<SyncCycleResult> {
    const empty: SyncCycleResult = {
      pushed: 0,
      pulled: 0,
      failed: 0,
      skipped: 0,
      pendingCount: 0,
    };

    const userId = this.getUserId();
    if (!userId) {
      return empty;
    }

    const connectivity = await this.connectivity.getStatus();
    if (connectivity.status !== 'online') {
      empty.pendingCount = await this.safeCountPending();
      return empty;
    }

    this.hooks.onSyncStarted?.();

    try {
      const pushResult = await this.pushPending(userId);
      const pullResult = await this.pullAndReconcile(userId);
      const pendingCount = await this.safeCountPending();

      const result: SyncCycleResult = {
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
        failed: pushResult.failed,
        skipped: pushResult.skipped,
        pendingCount,
      };

      if (pushResult.pushed > 0 || pullResult.pulled > 0) {
        this.hooks.onTasksMutated?.();
      }

      this.hooks.onSyncFinished?.(result);
      return result;
    } catch (error) {
      reportError('sync/cycle', error);
      this.hooks.onSyncError?.(toSyncUserMessage(error));
      throw error;
    }
  }

  private async pushPending(userId: UniqueId): Promise<{
    pushed: number;
    failed: number;
    skipped: number;
  }> {
    const pendingTasks = await this.taskRepository.getPendingSync(userId);
    const queueItems = await this.syncQueueRepository.listPending(
      Math.max(this.batchSize * 4, pendingTasks.length || this.batchSize),
    );
    const attempts = buildAttemptTracker(queueItems, this.maxAttempts);

    let pushed = 0;
    let failed = 0;
    let skipped = 0;
    const succeededIds: UniqueId[] = [];

    for (const task of pendingTasks.slice(0, this.batchSize)) {
      if (attempts.shouldSkip(task.id)) {
        skipped += 1;
        continue;
      }

      try {
        const operation = resolvePushOperation(task);
        if (operation === 'remove') {
          await this.remoteDataSource.remove(userId, task.id);
        } else {
          // Idempotent merge upsert — safe to retry after partial failure.
          await this.remoteDataSource.upsert(userId, {
            ...task,
            userId,
            syncStatus: 'synced',
          });
        }

        succeededIds.push(task.id);
        pushed += 1;
      } catch (error) {
        failed += 1;
        reportError('sync/push', error, {taskId: task.id});
        const message = toSyncUserMessage(error);
        const queueIds = attempts.getQueueIds(task.id);

        if (queueIds.length === 0) {
          const item = await this.syncQueueRepository.enqueue({
            entityType: 'task',
            entityId: task.id,
            operation:
              resolvePushOperation(task) === 'remove' ? 'delete' : 'update',
            payloadJson: null,
          });
          await this.syncQueueRepository.markAttempt(item.id, message);
        } else {
          for (const queueId of queueIds) {
            await this.syncQueueRepository.markAttempt(queueId, message);
          }
        }
      }
    }

    if (succeededIds.length > 0) {
      await this.taskRepository.markSynchronized(userId, succeededIds);
    }

    return {pushed, failed, skipped};
  }

  private async pullAndReconcile(userId: UniqueId): Promise<{pulled: number}> {
    const [remoteTasks, localTasks] = await Promise.all([
      this.remoteDataSource.fetchAll(userId),
      this.taskRepository.getAll(userId, {includeDeleted: true}),
    ]);

    const {toUpsert} = reconcileRemoteTasks({
      userId,
      localTasks,
      remoteTasks,
      now: toISODateString(),
    });

    if (toUpsert.length > 0) {
      await this.taskRepository.upsertMany(userId, toUpsert);
    }

    return {pulled: toUpsert.length};
  }

  private async safeCountPending(): Promise<number> {
    try {
      return await this.syncQueueRepository.countPending();
    } catch (error) {
      reportError('sync/pending-count', error);
      return 0;
    }
  }
}

export function createSyncManager(deps: SyncManagerDependencies): SyncManager {
  return new SyncManager(deps);
}

export {SYNC_MAX_ATTEMPTS};
