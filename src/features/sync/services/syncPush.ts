import type {UniqueId} from '@app-types/common';
import type {Task} from '@features/tasks/types';
import type {SyncQueueItem} from '../types/sync.types';

export interface AttemptTracker {
  maxAttempts: number;
  getAttempts(entityId: UniqueId): number;
  getQueueIds(entityId: UniqueId): readonly UniqueId[];
  shouldSkip(entityId: UniqueId): boolean;
}

/**
 * Builds per-entity attempt metadata from the durable sync_queue outbox.
 * Survives app restarts because attempts live in SQLite.
 */
export function buildAttemptTracker(
  queueItems: readonly SyncQueueItem[],
  maxAttempts: number,
): AttemptTracker {
  const attemptsByEntity = new Map<UniqueId, number>();
  const queueIdsByEntity = new Map<UniqueId, UniqueId[]>();

  for (const item of queueItems) {
    const current = attemptsByEntity.get(item.entityId) ?? 0;
    attemptsByEntity.set(item.entityId, Math.max(current, item.attempts));

    const ids = queueIdsByEntity.get(item.entityId) ?? [];
    ids.push(item.id);
    queueIdsByEntity.set(item.entityId, ids);
  }

  return {
    maxAttempts,
    getAttempts(entityId) {
      return attemptsByEntity.get(entityId) ?? 0;
    },
    getQueueIds(entityId) {
      return queueIdsByEntity.get(entityId) ?? [];
    },
    shouldSkip(entityId) {
      return (attemptsByEntity.get(entityId) ?? 0) >= maxAttempts;
    },
  };
}

export function resolvePushOperation(task: Task): 'upsert' | 'remove' {
  return task.syncStatus === 'deleted' || task.deletedAt ? 'remove' : 'upsert';
}
