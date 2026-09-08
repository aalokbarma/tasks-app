import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types';
import type {UniqueId} from '@app-types/common';

/**
 * Local persistence contract for tasks.
 * Implementations belong in database/ — not in this feature module.
 */
export interface TaskRepository {
  getAll(userId: UniqueId, filters?: TaskFilters): Promise<Task[]>;
  getById(userId: UniqueId, taskId: UniqueId): Promise<Task | null>;
  create(userId: UniqueId, input: CreateTaskInput): Promise<Task>;
  update(userId: UniqueId, input: UpdateTaskInput): Promise<Task>;
  delete(userId: UniqueId, taskId: UniqueId): Promise<void>;
  upsertMany(userId: UniqueId, tasks: Task[]): Promise<void>;
}
