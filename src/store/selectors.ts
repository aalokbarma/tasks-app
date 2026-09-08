import type {RootState} from '@store/rootReducer';

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectRememberedEmail = (state: RootState) =>
  state.auth.rememberedEmail;
export const selectIsAuthenticating = (state: RootState) =>
  state.auth.isAuthenticating;
export const selectAuthError = (state: RootState) => state.auth.errorMessage;

export const selectTasks = (state: RootState) => state.tasks.items;
export const selectSelectedTaskId = (state: RootState) =>
  state.tasks.selectedTaskId;
export const selectTasksLoading = (state: RootState) => state.tasks.isLoading;
export const selectTasksSaving = (state: RootState) => state.tasks.isSaving;
export const selectTasksError = (state: RootState) => state.tasks.errorMessage;
export const selectTaskById = (
  state: RootState,
  taskId: string | null | undefined,
) => {
  if (!taskId) {
    return null;
  }

  return state.tasks.items.find(task => task.id === taskId) ?? null;
};
export const selectSelectedTask = (state: RootState) =>
  selectTaskById(state, state.tasks.selectedTaskId);

export const selectNetworkStatus = (state: RootState) => state.network.status;
export const selectIsOnline = (state: RootState) =>
  state.network.status === 'online';

export const selectSyncState = (state: RootState) => state.sync;
export const selectPendingSyncCount = (state: RootState) =>
  state.sync.pendingCount;
export const selectFailedSyncCount = (state: RootState) =>
  state.sync.failedCount;
export const selectIsSyncing = (state: RootState) => state.sync.isSyncing;
export const selectSyncError = (state: RootState) => state.sync.lastError;

export const selectThemeMode = (state: RootState) => state.theme.mode;

/**
 * Single-pass connectivity banner derivation for Redux.
 * Prefer this over multiple selectors in ConnectivityStatusBar screens.
 */
export function selectConnectivityPresentation(state: RootState): {
  kind: 'hidden' | 'offline' | 'syncing' | 'pending' | 'failed';
  message: string;
  pendingCount: number;
  failedCount: number;
  canRetry: boolean;
} {
  const networkStatus = state.network.status;
  const isOnline = networkStatus === 'online';
  const isSyncing = state.sync.isSyncing;
  const pendingCount = state.sync.pendingCount;
  const failedCount = state.sync.failedCount;
  const syncError = state.sync.lastError;

  if (networkStatus === 'offline') {
    return {
      kind: 'offline',
      message:
        pendingCount > 0
          ? `Offline · ${pendingCount} change${
              pendingCount === 1 ? '' : 's'
            } saved on this device`
          : 'Offline · changes save on this device',
      pendingCount,
      failedCount,
      canRetry: false,
    };
  }

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
