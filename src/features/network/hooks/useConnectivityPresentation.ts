import {
  selectFailedSyncCount,
  selectIsOnline,
  selectIsSyncing,
  selectNetworkStatus,
  selectPendingSyncCount,
  selectSyncError,
} from '@store/selectors';
import {useAppSelector} from '@store/hooks';

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

/**
 * Derives a calm, offline-first status presentation from network + sync Redux.
 * Priority: offline → syncing → failed → pending → hidden.
 */
export function useConnectivityPresentation(): ConnectivityPresentation {
  const networkStatus = useAppSelector(selectNetworkStatus);
  const isOnline = useAppSelector(selectIsOnline);
  const isSyncing = useAppSelector(selectIsSyncing);
  const pendingCount = useAppSelector(selectPendingSyncCount);
  const failedCount = useAppSelector(selectFailedSyncCount);
  const syncError = useAppSelector(selectSyncError);

  if (networkStatus === 'offline') {
    return {
      kind: 'offline',
      message:
        pendingCount > 0
          ? `Offline · ${pendingCount} change${pendingCount === 1 ? '' : 's'} saved on this device`
          : 'Offline · changes save on this device',
      pendingCount,
      failedCount,
      canRetry: false,
    };
  }

  // Still determining connectivity — stay quiet (offline-first, no noise).
  if (networkStatus === 'unknown' || !isOnline) {
    if (isSyncing) {
      return {
        kind: 'syncing',
        message: 'Syncing…',
        pendingCount,
        failedCount,
        canRetry: false,
      };
    }

    return {
      kind: 'hidden',
      message: '',
      pendingCount,
      failedCount,
      canRetry: false,
    };
  }

  if (isSyncing) {
    return {
      kind: 'syncing',
      message:
        pendingCount > 0
          ? `Syncing ${pendingCount} change${pendingCount === 1 ? '' : 's'}…`
          : 'Syncing…',
      pendingCount,
      failedCount,
      canRetry: false,
    };
  }

  if (failedCount > 0 || syncError) {
    return {
      kind: 'failed',
      message:
        syncError ??
        (failedCount === 1
          ? '1 change could not sync. Saved locally — tap to retry.'
          : `${failedCount} changes could not sync. Saved locally — tap to retry.`),
      pendingCount,
      failedCount,
      canRetry: true,
    };
  }

  if (pendingCount > 0) {
    return {
      kind: 'pending',
      message: `${pendingCount} waiting to sync`,
      pendingCount,
      failedCount,
      canRetry: true,
    };
  }

  return {
    kind: 'hidden',
    message: '',
    pendingCount: 0,
    failedCount: 0,
    canRetry: false,
  };
}
