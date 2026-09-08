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
  useTasks,
  useTasksError,
  useTasksLoading,
  useTasksSaving,
} from './useTasks';

/**
 * Stable mutation helpers — no Redux list subscriptions.
 * Pair with useTasksListState / useTasksMutationState as needed.
 */
export function useTasksActions() {
  const dispatch = useAppDispatch();

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
    refresh,
    create,
    update,
    remove,
    toggleCompleted,
  };
}

/** List screen: items + load/error flags (not isSaving / selectedTask). */
export function useTasksListState() {
  return {
    tasks: useTasks(),
    isLoading: useTasksLoading(),
    errorMessage: useTasksError(),
  };
}

/** Mutation screens: saving + error only (not the full items array). */
export function useTasksMutationState() {
  return {
    isSaving: useTasksSaving(),
    errorMessage: useTasksError(),
  };
}

/**
 * @deprecated Prefer useTasksActions + useTasksListState / useTasksMutationState
 * to avoid over-subscribing screens to the full task list.
 */
export function useTasksController() {
  const actions = useTasksActions();
  const list = useTasksListState();
  const mutation = useTasksMutationState();

  return {
    ...actions,
    tasks: list.tasks,
    isLoading: list.isLoading,
    isSaving: mutation.isSaving,
    errorMessage: mutation.errorMessage ?? list.errorMessage,
  };
}
