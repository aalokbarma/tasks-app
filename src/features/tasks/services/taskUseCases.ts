import type {TaskRepository} from '../repositories/TaskRepository';
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types';
import type {UniqueId} from '@app-types/common';
import {notImplemented} from '@utils/notImplemented';

/**
 * Task use cases depend on TaskRepository only — never on Firestore.
 */
export interface TaskUseCases {
  listTasks(userId: UniqueId, filters?: TaskFilters): Promise<Task[]>;
  createTask(userId: UniqueId, input: CreateTaskInput): Promise<Task>;
  updateTask(userId: UniqueId, input: UpdateTaskInput): Promise<Task>;
  deleteTask(userId: UniqueId, taskId: UniqueId): Promise<void>;
  toggleCompleted(userId: UniqueId, taskId: UniqueId): Promise<Task>;
}

export function createTaskUseCases(
  _repository: TaskRepository,
): TaskUseCases {
  return {
    listTasks: () => notImplemented('TaskUseCases.listTasks'),
    createTask: () => notImplemented('TaskUseCases.createTask'),
    updateTask: () => notImplemented('TaskUseCases.updateTask'),
    deleteTask: () => notImplemented('TaskUseCases.deleteTask'),
    toggleCompleted: () => notImplemented('TaskUseCases.toggleCompleted'),
  };
}
