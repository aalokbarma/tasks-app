import type {TaskRepository} from '../repositories/TaskRepository';
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types';
import type {UniqueId} from '@app-types/common';

/**
 * Task use cases depend on TaskRepository only — never on Firestore.
 * Local SQLite is the source of truth.
 */
export interface TaskUseCases {
  listTasks(userId: UniqueId, filters?: TaskFilters): Promise<Task[]>;
  createTask(userId: UniqueId, input: CreateTaskInput): Promise<Task>;
  updateTask(userId: UniqueId, input: UpdateTaskInput): Promise<Task>;
  deleteTask(userId: UniqueId, taskId: UniqueId): Promise<void>;
  toggleCompleted(userId: UniqueId, taskId: UniqueId): Promise<Task>;
  getPendingSync(userId: UniqueId): Promise<Task[]>;
}

export function createTaskUseCases(repository: TaskRepository): TaskUseCases {
  return {
    listTasks(userId, filters) {
      return repository.getAll(userId, filters);
    },

    createTask(userId, input) {
      return repository.create(userId, input);
    },

    updateTask(userId, input) {
      return repository.update(userId, input);
    },

    async deleteTask(userId, taskId) {
      await repository.delete(userId, taskId);
    },

    async toggleCompleted(userId, taskId) {
      const existing = await repository.getById(userId, taskId);
      if (!existing) {
        throw new Error(`Task "${taskId}" was not found.`);
      }

      return repository.setCompleted(userId, taskId, !existing.completed);
    },

    getPendingSync(userId) {
      return repository.getPendingSync(userId);
    },
  };
}
