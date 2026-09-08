import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import {notImplemented} from '@utils/notImplemented';

/**
 * SQLite-backed TaskRepository adapter.
 * Bound at composition root once the database layer is implemented.
 */
export function createSqliteTaskRepository(): TaskRepository {
  return {
    getAll: () => notImplemented('SqliteTaskRepository.getAll'),
    getById: () => notImplemented('SqliteTaskRepository.getById'),
    create: () => notImplemented('SqliteTaskRepository.create'),
    update: () => notImplemented('SqliteTaskRepository.update'),
    delete: () => notImplemented('SqliteTaskRepository.delete'),
    upsertMany: () => notImplemented('SqliteTaskRepository.upsertMany'),
  };
}
