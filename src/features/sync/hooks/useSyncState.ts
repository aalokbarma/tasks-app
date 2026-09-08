import {selectSyncState} from '@store/selectors';
import {useAppSelector} from '@store/hooks';

export function useSyncState() {
  return useAppSelector(selectSyncState);
}
