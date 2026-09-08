import {selectIsOnline, selectNetworkStatus} from '@store/selectors';
import {useAppSelector} from '@store/hooks';

export function useNetworkStatus() {
  return useAppSelector(selectNetworkStatus);
}

export function useIsOnline() {
  return useAppSelector(selectIsOnline);
}
