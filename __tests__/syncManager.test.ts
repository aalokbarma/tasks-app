import type {SyncQueueItem} from '../src/features/sync/types';
import {createSyncManager} from '../src/features/sync/services/syncManager';
import {reconcileRemoteTasks} from '../src/features/sync/services/reconcileTasks';
import {
  buildAttemptTracker,
  resolvePushOperation,
} from '../src/features/sync/services/syncPush';

import {
  createMemoryConnectivity,
  createMemoryQueueRepository,
  createMemoryRemote,
  createMemoryTaskRepository,
  makeTask as task,
  wireQueueClearOnMark,
} from './helpers/memoryFakes';

describe('reconcileRemoteTasks (conflict resolution)', () => {
  it('does not overwrite dirty local rows', () => {
    const result = reconcileRemoteTasks({
      userId: 'user-1',
      localTasks: [
        task({
          id: 'a',
          title: 'Local dirty',
          syncStatus: 'updated',
          updatedAt: '2026-09-08T09:00:00.000Z',
        }),
      ],
      remoteTasks: [
        task({
          id: 'a',
          title: 'Remote',
          syncStatus: 'synced',
          updatedAt: '2026-09-08T12:00:00.000Z',
        }),
      ],
    });

    expect(result.toUpsert).toHaveLength(0);
  });

  it('applies newer remote onto synced local (LWW)', () => {
    const result = reconcileRemoteTasks({
      userId: 'user-1',
      localTasks: [
        task({
          id: 'a',
          title: 'Old',
          syncStatus: 'synced',
          updatedAt: '2026-09-08T09:00:00.000Z',
        }),
      ],
      remoteTasks: [
        task({
          id: 'a',
          title: 'New',
          syncStatus: 'synced',
          updatedAt: '2026-09-08T12:00:00.000Z',
        }),
      ],
    });

    expect(result.toUpsert).toHaveLength(1);
    expect(result.toUpsert[0]?.title).toBe('New');
  });

  it('keeps local when timestamps are equal (idempotent)', () => {
    const stamp = '2026-09-08T12:00:00.000Z';
    const result = reconcileRemoteTasks({
      userId: 'user-1',
      localTasks: [
        task({
          id: 'a',
          title: 'Local',
          syncStatus: 'synced',
          updatedAt: stamp,
        }),
      ],
      remoteTasks: [
        task({
          id: 'a',
          title: 'Remote same time',
          syncStatus: 'synced',
          updatedAt: stamp,
        }),
      ],
    });

    expect(result.toUpsert).toHaveLength(0);
  });

  it('tombstones synced locals missing from remote', () => {
    const result = reconcileRemoteTasks({
      userId: 'user-1',
      now: '2026-09-08T15:00:00.000Z',
      localTasks: [
        task({
          id: 'gone',
          title: 'Deleted elsewhere',
          syncStatus: 'synced',
        }),
      ],
      remoteTasks: [],
    });

    expect(result.toUpsert).toHaveLength(1);
    expect(result.toUpsert[0]).toMatchObject({
      id: 'gone',
      deletedAt: '2026-09-08T15:00:00.000Z',
      syncStatus: 'synced',
    });
  });
});

describe('syncPush helpers', () => {
  it('resolves create/update as upsert and delete as remove', () => {
    expect(
      resolvePushOperation(task({id: '1', title: 'c', syncStatus: 'created'})),
    ).toBe('upsert');
    expect(
      resolvePushOperation(task({id: '1', title: 'u', syncStatus: 'updated'})),
    ).toBe('upsert');
    expect(
      resolvePushOperation(
        task({
          id: '1',
          title: 'd',
          syncStatus: 'deleted',
          deletedAt: '2026-09-08T11:00:00.000Z',
        }),
      ),
    ).toBe('remove');
  });

  it('skips entities that exhausted max attempts', () => {
    const queue: SyncQueueItem[] = [
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 5,
        lastError: 'network',
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ];
    const tracker = buildAttemptTracker(queue, 5);
    expect(tracker.shouldSkip('t1')).toBe(true);
    expect(tracker.shouldSkip('other')).toBe(false);
  });
});

describe('SyncManager', () => {
  it('pushes offline create when online', async () => {
    const local = createMemoryTaskRepository([
      task({id: 't1', title: 'Offline create', syncStatus: 'created'}),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote();
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const result = await manager.flushWithResult();

    expect(result.pushed).toBe(1);
    expect(remote.store.has('t1')).toBe(true);
    expect((await local.getById('user-1', 't1'))?.syncStatus).toBe('synced');
    expect(await queue.countPending()).toBe(0);
  });

  it('pushes offline update when online', async () => {
    const local = createMemoryTaskRepository([
      task({
        id: 't1',
        title: 'Edited offline',
        syncStatus: 'updated',
        updatedAt: '2026-09-08T11:00:00.000Z',
      }),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'update',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T11:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote([
      task({
        id: 't1',
        title: 'Old remote',
        syncStatus: 'synced',
        updatedAt: '2026-09-08T09:00:00.000Z',
      }),
    ]);
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const result = await manager.flushWithResult();
    expect(result.pushed).toBe(1);
    expect(remote.store.get('t1')?.title).toBe('Edited offline');
  });

  it('pushes offline delete when online', async () => {
    const local = createMemoryTaskRepository([
      task({
        id: 't1',
        title: 'Gone',
        syncStatus: 'deleted',
        deletedAt: '2026-09-08T11:00:00.000Z',
      }),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'delete',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T11:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote([
      task({id: 't1', title: 'Gone', syncStatus: 'synced'}),
    ]);
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const result = await manager.flushWithResult();
    expect(result.pushed).toBe(1);
    expect(remote.store.has('t1')).toBe(false);
  });

  it('retries after a failed synchronization', async () => {
    const local = createMemoryTaskRepository([
      task({id: 't1', title: 'Retry me', syncStatus: 'created'}),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote();
    remote.failNextUpserts = 1;
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const first = await manager.flushWithResult();
    expect(first.failed).toBe(1);
    expect(first.pushed).toBe(0);
    expect(queue.items[0]?.attempts).toBe(1);
    expect(remote.store.has('t1')).toBe(false);

    const second = await manager.flushWithResult();
    expect(second.pushed).toBe(1);
    expect(remote.store.has('t1')).toBe(true);
  });

  it('skips entities that exceeded max attempts', async () => {
    const local = createMemoryTaskRepository([
      task({id: 't1', title: 'Stuck', syncStatus: 'created'}),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 5,
        lastError: 'gave up',
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote();

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
      maxAttempts: 5,
    });

    const result = await manager.flushWithResult();
    expect(result.skipped).toBe(1);
    expect(result.pushed).toBe(0);
    expect(remote.store.has('t1')).toBe(false);
  });

  it('prevents duplicate concurrent sync executions', async () => {
    let upsertCalls = 0;
    const local = createMemoryTaskRepository([
      task({id: 't1', title: 'Once', syncStatus: 'created'}),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote();
    const slowUpsert = remote.upsert.bind(remote);
    remote.upsert = async (userId, next) => {
      upsertCalls += 1;
      await new Promise<void>(resolve => setTimeout(resolve, 30));
      return slowUpsert(userId, next);
    };
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const [a, b] = await Promise.all([
      manager.flushWithResult(),
      manager.flushWithResult(),
    ]);

    expect(a).toEqual(b);
    expect(upsertCalls).toBe(1);
  });

  it('auto-flushes when connectivity returns', async () => {
    const local = createMemoryTaskRepository([
      task({id: 't1', title: 'Queued', syncStatus: 'created'}),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 't1',
        operation: 'create',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote();
    const connectivity = createMemoryConnectivity({
      status: 'offline',
      isInternetReachable: false,
    });
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity,
      getUserId: () => 'user-1',
    });

    await manager.start();
    expect(remote.store.has('t1')).toBe(false);

    connectivity.goOnline();
    await new Promise<void>(resolve => setTimeout(resolve, 40));

    expect(remote.store.has('t1')).toBe(true);
    await manager.stop();
  });

  it('scheduleFlush pushes pending work after debounce when online', async () => {
    const local = createMemoryTaskRepository();
    const queue = createMemoryQueueRepository();
    const remote = createMemoryRemote();
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
      autoFlushDelayMs: 20,
    });

    await manager.start();

    await local.upsertMany('user-1', [
      task({id: 't3', title: 'Scheduled', syncStatus: 'created'}),
    ]);
    await queue.enqueue({
      entityType: 'task',
      entityId: 't3',
      operation: 'create',
      payloadJson: null,
    });

    manager.scheduleFlush();
    expect(remote.store.has('t3')).toBe(false);

    await new Promise<void>(resolve => setTimeout(resolve, 50));
    expect(remote.store.has('t3')).toBe(true);

    await manager.stop();
  });

  it('pulls remote-only tasks after push without clobbering dirty locals', async () => {
    const local = createMemoryTaskRepository([
      task({
        id: 'dirty',
        title: 'Local edit',
        syncStatus: 'updated',
        updatedAt: '2026-09-08T11:00:00.000Z',
      }),
    ]);
    const queue = createMemoryQueueRepository([
      {
        id: 'q1',
        entityType: 'task',
        entityId: 'dirty',
        operation: 'update',
        payloadJson: null,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T11:00:00.000Z',
      },
    ]);
    const remote = createMemoryRemote([
      task({
        id: 'dirty',
        title: 'Stale remote',
        syncStatus: 'synced',
        updatedAt: '2026-09-08T09:00:00.000Z',
      }),
      task({
        id: 'remote-only',
        title: 'From cloud',
        syncStatus: 'synced',
        updatedAt: '2026-09-08T12:00:00.000Z',
      }),
    ]);
    wireQueueClearOnMark(local, queue);

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity: createMemoryConnectivity(),
      getUserId: () => 'user-1',
    });

    const result = await manager.flushWithResult();
    expect(result.pushed).toBe(1);
    expect(result.pulled).toBe(1);

    expect((await local.getById('user-1', 'dirty'))?.title).toBe('Local edit');
    expect((await local.getById('user-1', 'dirty'))?.syncStatus).toBe('synced');
    expect((await local.getById('user-1', 'remote-only'))?.title).toBe(
      'From cloud',
    );
  });
});
