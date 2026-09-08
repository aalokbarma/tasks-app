import {useCallback} from 'react';

import {useAppDispatch} from '@store/hooks';
import type {CreateTaskInput, TaskFilters, UpdateTaskInput} from '../types';
import type {UniqueId} from '@app-types/common';
import {
  createTask,
  deleteTask,
  loadTasks,
  toggleTaskCompleted,
  updateTask,
} from '../slice/tasksThunks';
import {
  useSelectedTask,
  useTasks,
  useTasksError,
  useTasksLoading,
  useTasksSaving,
} from './useTasks';

/**
 * Feature controller — keeps task mutations out of screen JSX.
 * All paths go UI → thunk → use case → SQLite (offline-first).
 */
export function useTasksController() {
  const dispatch = useAppDispatch();
  const tasks = useTasks();
  const isLoading = useTasksLoading();
  const isSaving = useTasksSaving();
  const errorMessage = useTasksError();
  const selectedTask = useSelectedTask();

  const refresh = useCallback(
    (filters?: TaskFilters) => dispatch(loadTasks(filters)),
    [dispatch],
  );

  const create = useCallback(
    (input: CreateTaskInput) => dispatch(createTask(input)),
    [dispatch],
  );

  const update = useCallback(
    (input: UpdateTaskInput) => dispatch(updateTask(input)),
    [dispatch],
  );

  const remove = useCallback(
    (taskId: UniqueId) => dispatch(deleteTask(taskId)),
    [dispatch],
  );

  const toggleCompleted = useCallback(
    (taskId: UniqueId) => dispatch(toggleTaskCompleted(taskId)),
    [dispatch],
  );

  return {
    tasks,
    isLoading,
    isSaving,
    errorMessage,
    selectedTask,
    refresh,
    create,
    update,
    remove,
    toggleCompleted,
  };
}
