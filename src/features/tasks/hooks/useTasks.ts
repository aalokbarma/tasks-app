import {
  selectSelectedTask,
  selectTasks,
  selectTasksError,
  selectTasksLoading,
  selectTasksSaving,
} from '@store/selectors';
import {useAppSelector} from '@store/hooks';

export function useTasks() {
  return useAppSelector(selectTasks);
}

export function useTasksLoading() {
  return useAppSelector(selectTasksLoading);
}

export function useTasksSaving() {
  return useAppSelector(selectTasksSaving);
}

export function useTasksError() {
  return useAppSelector(selectTasksError);
}

export function useSelectedTask() {
  return useAppSelector(selectSelectedTask);
}
