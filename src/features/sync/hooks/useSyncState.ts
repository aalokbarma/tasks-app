import {useAppSelector} from '@store/hooks';

export function useSyncState() {
  return useAppSelector(state => state.sync);
}
