import type {AppDispatch} from '@store/index';
import {hydrateAuthSession} from '@features/auth/slice/authThunks';
import {
  setNetworkMonitoring,
  setNetworkStatus,
} from '@features/network/slice/networkSlice';
import {refreshNetworkStatus} from '@features/network/slice/networkThunks';
import {refreshPendingSyncCount} from '@features/sync/slice/syncThunks';
import {getConnectivityService} from '@store/dependencies';

let stopNetworkMonitor: (() => void) | null = null;

/**
 * Application bootstrap side-effects that belong outside React components.
 */
export async function bootstrapAppState(dispatch: AppDispatch): Promise<void> {
  await dispatch(hydrateAuthSession());
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

export function teardownNetworkMonitoring(): void {
  stopNetworkMonitor?.();
  stopNetworkMonitor = null;
}
