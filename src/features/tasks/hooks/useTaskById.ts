import {useAppSelector} from '@store/hooks';
import type {UniqueId} from '@app-types/common';
import type {Task} from '../types';

export function useTaskById(taskId: UniqueId | undefined): Task | null {
  return useAppSelector(state => {
    if (!taskId) {
      return null;
    }

    return state.tasks.items.find(task => task.id === taskId) ?? null;
  });
}
