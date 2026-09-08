import {useAppSelector} from '@store/hooks';
import {selectConnectivityPresentation} from '@store/selectors';

export type ConnectivityBannerKind =
  | 'hidden'
  | 'offline'
  | 'syncing'
  | 'pending'
  | 'failed';

export interface ConnectivityPresentation {
  kind: ConnectivityBannerKind;
  message: string;
  pendingCount: number;
  failedCount: number;
  canRetry: boolean;
}

function presentationsEqual(
  a: ConnectivityPresentation,
  b: ConnectivityPresentation,
): boolean {
  return (
    a.kind === b.kind &&
    a.message === b.message &&
    a.pendingCount === b.pendingCount &&
    a.failedCount === b.failedCount &&
    a.canRetry === b.canRetry
  );
}

/**
 * Derives a calm, offline-first status presentation from network + sync Redux.
 * Uses one selector + equality check so mounted screens do not over-render.
 */
export function useConnectivityPresentation(): ConnectivityPresentation {
  return useAppSelector(selectConnectivityPresentation, presentationsEqual);
}
