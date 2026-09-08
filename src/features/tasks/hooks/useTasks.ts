import {useAppSelector} from '@store/hooks';

export function useTasks() {
  return useAppSelector(state => state.tasks.items);
}

export function useTasksLoading() {
  return useAppSelector(state => state.tasks.isLoading);
}
