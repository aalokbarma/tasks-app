import type {UniqueId} from '../src/types/common';
import type {Task} from '../src/features/tasks/types';
import type {TaskRepository} from '../src/features/tasks/repositories/TaskRepository';
import type {TaskRemoteDataSource} from '../src/features/tasks/services/TaskRemoteDataSource';
import type {SyncQueueItem, SyncQueueRepository} from '../src/features/sync/types';
import type {ConnectivityService, NetworkSnapshot} from '../src/services/network/connectivity';
import {createSyncManager} from '../src/features/sync/services/syncManager';
import {reconcileRemoteTasks} from '../src/features/sync/services/reconcileTasks';

function task(partial: Partial<Task> & Pick<Task, 'id' | 'title' | 'syncStatus'>): Task {
  const now = '2026-09-08T10:00:00.000Z';
  return {
    userId: 'user-1',
    description: null,
    completed: false,
    dueAt: null,
    reminderAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...partial,
  };
}

function createMemoryTaskRepository(seed: Task[] = []): TaskRepository {
  const tasks = new Map<UniqueId, Task>(seed.map(item => [item.id, item]));

  return {
    async getAll(userId, filters) {
      return [...tasks.values()].filter(item => {
        if (item.userId !== userId) {
          return false;
        }
        if (!filters?.includeDeleted && item.deletedAt) {
          return false;
        }
        if (
          typeof filters?.completed === 'boolean' &&
          item.completed !== filters.completed
        ) {
          return false;
        }
        return true;
      });
    },
    async getById(userId, taskId) {
      const found = tasks.get(taskId);
      return found && found.userId === userId ? found : null;
    },
    async create() {
      throw new Error('not used');
    },
    async update() {
      throw new Error('not used');
    },
    async delete() {
      throw new Error('not used');
    },
    async setCompleted() {
      throw new Error('not used');
    },
    async upsertMany(userId, items) {
      for (const item of items) {
        if (item.userId !== userId) {
          throw new Error('user mismatch');
        }
        tasks.set(item.id, item);
      }
    },
    async getPendingSync(userId) {
      return [...tasks.values()].filter(
        item =>
          item.userId === userId &&
          ['created', 'updated', 'deleted', 'pending'].includes(item.syncStatus),
      );
    },
    async markSynchronized(userId, taskIds) {
      for (const id of taskIds) {
        const existing = tasks.get(id);
        if (existing && existing.userId === userId) {
          tasks.set(id, {...existing, syncStatus: 'synced'});
        }
      }
    },
  };
}

function createMemoryQueueRepository(
  seed: SyncQueueItem[] = [],
): SyncQueueRepository & {items: SyncQueueItem[]} {
  const items = [...seed];

  return {
    items,
    async enqueue(input) {
      const item: SyncQueueItem = {
        id: input.id ?? `queue-${items.length + 1}`,
        entityType: 'task',
        entityId: input.entityId,
        operation: input.operation,
        payloadJson: input.payloadJson,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      };
      items.push(item);
      return item;
    },
    async listPending(limit) {
      return items.slice(0, limit);
    },
    async markAttempt(id, errorMessage) {
      const item = items.find(entry => entry.id === id);
      if (!item) {
        throw new Error(`missing ${id}`);
      }
      item.attempts += 1;
      item.lastError = errorMessage;
    },
    async remove(id) {
      const index = items.findIndex(entry => entry.id === id);
      if (index >= 0) {
        items.splice(index, 1);
      }
    },
    async markSynchronized(ids) {
      for (const id of [...ids]) {
        const index = items.findIndex(entry => entry.id === id);
        if (index >= 0) {
          items.splice(index, 1);
        }
      }
    },
    async countPending() {
      return items.length;
    },
  };
}

function createMemoryRemote(
  seed: Task[] = [],
): TaskRemoteDataSource & {store: Map<UniqueId, Task>; failNextUpserts: number} {
  const store = new Map(seed.map(item => [item.id, item]));

  return {
    store,
    failNextUpserts: 0,
    async fetchAll() {
      return [...store.values()];
    },
    async upsert(_userId, next) {
      if (this.failNextUpserts > 0) {
        this.failNextUpserts -= 1;
        throw new Error('network blip');
      }
      store.set(next.id, next);
    },
    async remove(_userId, taskId) {
      store.delete(taskId);
    },
  };
}

function createMemoryConnectivity(
  initial: NetworkSnapshot = {
    status: 'online',
    isInternetReachable: true,
  },
): ConnectivityService & {
  snapshot: NetworkSnapshot;
  listeners: Array<(snapshot: NetworkSnapshot) => void>;
  goOnline: () => void;
  goOffline: () => void;
} {
  const listeners: Array<(snapshot: NetworkSnapshot) => void> = [];
  const service = {
    snapshot: initial,
    listeners,
    async getStatus() {
      return service.snapshot;
    },
    subscribe(listener: (snapshot: NetworkSnapshot) => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    },
    goOnline() {
      service.snapshot = {status: 'online', isInternetReachable: true};
      listeners.forEach(listener => listener(service.snapshot));
    },
    goOffline() {
      service.snapshot = {status: 'offline', isInternetReachable: false};
      listeners.forEach(listener => listener(service.snapshot));
    },
  };

  return service;
}

describe('reconcileRemoteTasks (LWW)', () => {
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

  it('applies newer remote onto synced local', () => {
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
    const connectivity = createMemoryConnectivity();

    const manager = createSyncManager({
      taskRepository: local,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity,
      getUserId: () => 'user-1',
    });

    // Simulate markSynchronized also clearing queue like SQLite does.
    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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

    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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

    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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

    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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

    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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

    const originalMark = local.markSynchronized.bind(local);
    local.markSynchronized = async (userId, ids) => {
      await originalMark(userId, ids);
      await queue.markSynchronized(
        queue.items.filter(item => ids.includes(item.entityId)).map(item => item.id),
      );
    };

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
});
