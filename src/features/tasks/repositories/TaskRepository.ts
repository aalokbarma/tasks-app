import type {UniqueId} from '@app-types/common';

import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types';

/**
 * Local persistence contract for tasks.
 * Implementations belong in database/ — not in this feature module.
 * Local SQLite is the UI source of truth (offline-first).
 */
export interface TaskRepository {
  getAll(userId: UniqueId, filters?: TaskFilters): Promise<Task[]>;
  getById(userId: UniqueId, taskId: UniqueId): Promise<Task | null>;
  create(userId: UniqueId, input: CreateTaskInput): Promise<Task>;
  update(userId: UniqueId, input: UpdateTaskInput): Promise<Task>;
  delete(userId: UniqueId, taskId: UniqueId): Promise<void>;
  setCompleted(
    userId: UniqueId,
    taskId: UniqueId,
    completed: boolean,
  ): Promise<Task>;
  upsertMany(userId: UniqueId, tasks: Task[]): Promise<void>;
  /** Tasks with local changes waiting to sync. */
  getPendingSync(userId: UniqueId): Promise<Task[]>;
  /** Marks local tasks as synced after a successful remote push. */
  markSynchronized(
    userId: UniqueId,
    taskIds: readonly UniqueId[],
  ): Promise<void>;
}
