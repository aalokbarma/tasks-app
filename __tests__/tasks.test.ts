import {createTaskUseCases} from '@features/tasks/services/taskUseCases';

import {
  createMemoryConnectivity,
  createMemoryQueueRepository,
  createMemoryRemote,
  createMemoryTaskRepository,
  makeTask,
  wireQueueClearOnMark,
} from './helpers/memoryFakes';
import {createSyncManager} from '@features/sync/services/syncManager';

describe('task use cases (local SQLite-shaped repository)', () => {
  const userId = 'user-1';

  it('creates, updates, deletes, and toggles completion offline', async () => {
    const repository = createMemoryTaskRepository();
    const useCases = createTaskUseCases(repository);

    const created = await useCases.createTask(userId, {
      title: '  Buy milk ',
      description: '2%',
    });

    expect(created.title).toBe('Buy milk');
    expect(created.syncStatus).toBe('created');
    expect(created.completed).toBe(false);

    const listed = await useCases.listTasks(userId);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(created.id);

    const updated = await useCases.updateTask(userId, {
      id: created.id,
      title: 'Buy oat milk',
    });
    // Never-synced creates stay "created" until first successful push.
    expect(updated.syncStatus).toBe('created');
    expect(updated.title).toBe('Buy oat milk');

    const toggled = await useCases.toggleCompleted(userId, created.id);
    expect(toggled.completed).toBe(true);

    await useCases.deleteTask(userId, created.id);
    // Local-only create is hard-deleted (no remote tombstone needed).
    expect(await useCases.listTasks(userId)).toHaveLength(0);
    expect(await repository.getById(userId, created.id)).toBeNull();
  });

  it('soft-deletes previously synced tasks for pending delete sync', async () => {
    const repository = createMemoryTaskRepository([
      makeTask({
        id: 'synced-1',
        title: 'Keep tombstone',
        syncStatus: 'synced',
      }),
    ]);
    const useCases = createTaskUseCases(repository);

    await useCases.deleteTask(userId, 'synced-1');

    expect(await useCases.listTasks(userId)).toHaveLength(0);
    const withDeleted = await repository.getAll(userId, {
      includeDeleted: true,
    });
    expect(withDeleted[0]?.syncStatus).toBe('deleted');
    expect(withDeleted[0]?.deletedAt).toBeTruthy();
  });

  it('retrieves tasks from local storage while offline (no remote calls)', async () => {
    const repository = createMemoryTaskRepository([
      makeTask({id: 'a', title: 'Local A', syncStatus: 'synced'}),
      makeTask({id: 'b', title: 'Local B', syncStatus: 'created'}),
    ]);
    const remote = createMemoryRemote();
    const useCases = createTaskUseCases(repository);

    const connectivity = createMemoryConnectivity({
      status: 'offline',
      isInternetReachable: false,
    });

    const manager = createSyncManager({
      taskRepository: repository,
      syncQueueRepository: createMemoryQueueRepository(),
      remoteDataSource: remote,
      connectivity,
      getUserId: () => userId,
    });

    const syncResult = await manager.flushWithResult();
    expect(syncResult.pushed).toBe(0);
    expect(remote.store.size).toBe(0);

    const tasks = await useCases.listTasks(userId);
    expect(tasks.map(task => task.title).sort()).toEqual([
      'Local A',
      'Local B',
    ]);
  });

  it('keeps local mutations pending while offline, then syncs on reconnect', async () => {
    const repository = createMemoryTaskRepository();
    const queue = createMemoryQueueRepository();
    const remote = createMemoryRemote();
    const connectivity = createMemoryConnectivity({
      status: 'offline',
      isInternetReachable: false,
    });
    const useCases = createTaskUseCases(repository);

    const created = await useCases.createTask(userId, {title: 'Offline note'});
    await queue.enqueue({
      entityType: 'task',
      entityId: created.id,
      operation: 'create',
      payloadJson: null,
    });

    wireQueueClearOnMark(repository, queue);

    const manager = createSyncManager({
      taskRepository: repository,
      syncQueueRepository: queue,
      remoteDataSource: remote,
      connectivity,
      getUserId: () => userId,
    });

    await manager.start();
    expect(remote.store.has(created.id)).toBe(false);
    expect((await repository.getPendingSync(userId)).length).toBe(1);

    connectivity.goOnline();
    await new Promise<void>(resolve => setTimeout(resolve, 40));

    expect(remote.store.has(created.id)).toBe(true);
    expect((await repository.getById(userId, created.id))?.syncStatus).toBe(
      'synced',
    );
    await manager.stop();
  });
});
