import type {AppDispatch} from '@store/index';
import {store} from '@store/index';
import {
  clearUserScopedApplicationState,
  hydrateAuthSession,
} from '@features/auth/slice/authThunks';
import {setAuthUser} from '@features/auth/slice/authSlice';
import {
  setNetworkMonitoring,
  setNetworkStatus,
} from '@features/network/slice/networkSlice';
import {refreshNetworkStatus} from '@features/network/slice/networkThunks';
import {createSyncManager} from '@features/sync/services/syncManager';
import {
  setLastSyncedAt,
  setPendingCount,
  setSyncError,
  setSyncing,
} from '@features/sync/slice/syncSlice';
import {
  refreshPendingSyncCount,
  runSynchronization,
} from '@features/sync/slice/syncThunks';
import {loadTasks} from '@features/tasks/slice/tasksThunks';
import {toISODateString} from '@utils/date';
import type {UniqueId} from '@app-types/common';
import {
  getConnectivityService,
  registerSyncManager,
  requireAuthRepository,
  requireSyncManager,
  requireSyncQueueRepository,
  requireTaskRemoteDataSource,
  requireTaskRepository,
} from '@store/dependencies';

let stopNetworkMonitor: (() => void) | null = null;
let stopAuthMonitor: (() => void) | null = null;
let lastObservedUserId: UniqueId | null | undefined;
let syncManagerStarted = false;

/**
 * Application bootstrap side-effects that belong outside React components.
 */
export async function bootstrapAppState(dispatch: AppDispatch): Promise<void> {
  const hydrateResult = await dispatch(hydrateAuthSession());
  if (hydrateAuthSession.fulfilled.match(hydrateResult)) {
    lastObservedUserId = hydrateResult.payload.user?.uid ?? null;
  } else {
    lastObservedUserId = null;
  }

  startAuthSessionObserver(dispatch);
  await ensureSyncManager(dispatch);

  await dispatch(refreshNetworkStatus());

  if (!stopNetworkMonitor) {
    stopNetworkMonitor = getConnectivityService().subscribe(snapshot => {
      dispatch(setNetworkStatus(snapshot));
    });
    dispatch(setNetworkMonitoring(true));
  }

  try {
    await dispatch(refreshPendingSyncCount());
  } catch {
    // Database may still be initializing; pending count refreshes after local persistence is ready.
  }
}

async function ensureSyncManager(dispatch: AppDispatch): Promise<void> {
  if (syncManagerStarted) {
    return;
  }

  try {
    const manager = createSyncManager({
      taskRepository: requireTaskRepository(),
      syncQueueRepository: requireSyncQueueRepository(),
      remoteDataSource: requireTaskRemoteDataSource(),
      connectivity: getConnectivityService(),
      getUserId: () => store.getState().auth.user?.uid ?? null,
      hooks: {
        onSyncStarted: () => {
          dispatch(setSyncing(true));
          dispatch(setSyncError(null));
        },
        onSyncFinished: result => {
          dispatch(setPendingCount(result.pendingCount));
          dispatch(setLastSyncedAt(toISODateString()));
          dispatch(setSyncing(false));

          if (result.failed > 0) {
            dispatch(
              setSyncError(
                `${result.failed} change(s) failed to sync and will retry later.`,
              ),
            );
          }

          if (result.pushed > 0 || result.pulled > 0) {
            dispatch(loadTasks());
          }
        },
        onSyncError: message => {
          dispatch(setSyncError(message));
          dispatch(setSyncing(false));
        },
      },
    });

    registerSyncManager(manager);
    syncManagerStarted = true;
    await manager.start();
  } catch (error) {
    console.error('[sync] Failed to start SyncManager.', error);
  }
}

function startAuthSessionObserver(dispatch: AppDispatch): void {
  if (stopAuthMonitor) {
    return;
  }

  stopAuthMonitor = requireAuthRepository().subscribe(session => {
    const nextUserId = session.user?.uid ?? null;
    const previousUserId = lastObservedUserId;

    if (previousUserId === nextUserId) {
      return;
    }

    if (previousUserId) {
      clearUserScopedApplicationState(dispatch);
    }

    lastObservedUserId = nextUserId;
    dispatch(setAuthUser(session.user));

    if (nextUserId && syncManagerStarted) {
      dispatch(refreshPendingSyncCount());
      dispatch(runSynchronization());
    }
  });
}

export function teardownNetworkMonitoring(): void {
  stopNetworkMonitor?.();
  stopNetworkMonitor = null;
}

export function teardownAuthMonitoring(): void {
  stopAuthMonitor?.();
  stopAuthMonitor = null;
  lastObservedUserId = undefined;
}

export function teardownAppObservers(): void {
  teardownNetworkMonitoring();
  teardownAuthMonitoring();

  if (syncManagerStarted) {
    requireSyncManager()
      .stop()
      .catch(() => undefined);
    syncManagerStarted = false;
  }
}
