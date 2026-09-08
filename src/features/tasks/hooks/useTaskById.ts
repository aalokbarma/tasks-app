import {useAppSelector} from '@store/hooks';
import {selectTaskById} from '@store/selectors';
import type {UniqueId} from '@app-types/common';
import type {Task} from '../types';

export function useTaskById(taskId: UniqueId | undefined): Task | null {
  return useAppSelector(state => selectTaskById(state, taskId));
}
