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
  setFailedCount,
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
import {
  bootstrapLocalReminders,
  registerPushForUser,
} from '@features/notifications/services/notificationBootstrap';
import {subscribeForegroundMessages} from '@services/notifications/fcmHandlers';
import {toISODateString} from '@utils/date';
import type {UniqueId} from '@app-types/common';
import {
  getConnectivityService,
  registerSyncManager,
  requireAuthRepository,
  requireLocalNotificationService,
  requirePushNotificationService,
  requireSyncManager,
  requireSyncQueueRepository,
  requireTaskReminderCoordinator,
  requireTaskRemoteDataSource,
  requireTaskRepository,
} from '@store/dependencies';

let stopNetworkMonitor: (() => void) | null = null;
let stopAuthMonitor: (() => void) | null = null;
let stopForegroundMessages: (() => void) | null = null;
let stopTokenRefresh: (() => void) | null = null;
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
  startForegroundMessageListener();

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

  if (lastObservedUserId) {
    await bootstrapNotificationsForUser(lastObservedUserId);
  }
}

async function bootstrapNotificationsForUser(userId: UniqueId): Promise<void> {
  stopTokenRefresh?.();
  stopTokenRefresh = null;

  await bootstrapLocalReminders({
    local: requireLocalNotificationService(),
    coordinator: requireTaskReminderCoordinator(),
    loadTasks: async () => {
      try {
        return await requireTaskRepository().getAll(userId);
      } catch {
        return [];
      }
    },
  });

  stopTokenRefresh = await registerPushForUser({
    push: requirePushNotificationService(),
    userId,
  });
}

function startForegroundMessageListener(): void {
  if (stopForegroundMessages) {
    return;
  }

  stopForegroundMessages = subscribeForegroundMessages();
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
          dispatch(setFailedCount(result.failed));
          dispatch(setLastSyncedAt(toISODateString()));
          dispatch(setSyncing(false));

          if (result.failed > 0) {
            dispatch(
              setSyncError(
                result.failed === 1
                  ? '1 change could not sync. Saved on this device — will retry.'
                  : `${result.failed} changes could not sync. Saved on this device — will retry.`,
              ),
            );
          } else {
            dispatch(setSyncError(null));
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
      stopTokenRefresh?.();
      stopTokenRefresh = null;
      requireLocalNotificationService()
        .cancelAll()
        .catch(() => undefined);
    }

    lastObservedUserId = nextUserId;
    dispatch(setAuthUser(session.user));

    if (nextUserId) {
      dispatch(refreshPendingSyncCount());
      if (syncManagerStarted) {
        dispatch(runSynchronization());
      }
      bootstrapNotificationsForUser(nextUserId).catch(error => {
        console.error('[notifications] User bootstrap failed.', error);
      });
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

  stopForegroundMessages?.();
  stopForegroundMessages = null;
  stopTokenRefresh?.();
  stopTokenRefresh = null;

  if (syncManagerStarted) {
    requireSyncManager()
      .stop()
      .catch(() => undefined);
    syncManagerStarted = false;
  }
}
