import type {AppDispatch} from '@store/index';
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
import {refreshPendingSyncCount} from '@features/sync/slice/syncThunks';
import {
  getConnectivityService,
  requireAuthRepository,
} from '@store/dependencies';
import type {UniqueId} from '@app-types/common';

let stopNetworkMonitor: (() => void) | null = null;
let stopAuthMonitor: (() => void) | null = null;
let lastObservedUserId: UniqueId | null | undefined;

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

function startAuthSessionObserver(dispatch: AppDispatch): void {
  if (stopAuthMonitor) {
    return;
  }

  stopAuthMonitor = requireAuthRepository().subscribe(session => {
    const nextUserId = session.user?.uid ?? null;
    const previousUserId = lastObservedUserId;

    // Same identity — ignore. Avoids wiping login form errors on no-op emissions.
    if (previousUserId === nextUserId) {
      return;
    }

    if (previousUserId) {
      clearUserScopedApplicationState(dispatch);
    }

    lastObservedUserId = nextUserId;
    dispatch(setAuthUser(session.user));
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
}
