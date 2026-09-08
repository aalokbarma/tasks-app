import NetInfo, {type NetInfoState} from '@react-native-community/netinfo';

import type {ConnectivityStatus} from '@app-types/common';

export interface NetworkSnapshot {
  status: ConnectivityStatus;
  isInternetReachable: boolean | null;
}

export interface ConnectivityService {
  getStatus(): Promise<NetworkSnapshot>;
  subscribe(listener: (snapshot: NetworkSnapshot) => void): () => void;
}

function mapNetInfoState(state: NetInfoState): NetworkSnapshot {
  const offline = state.isConnected === false;
  const unreachable = state.isInternetReachable === false;

  let status: ConnectivityStatus = 'unknown';
  if (offline || unreachable) {
    status = 'offline';
  } else if (state.isConnected === true) {
    status = 'online';
  }

  return {
    status,
    isInternetReachable: state.isInternetReachable,
  };
}

/**
 * Single NetInfo subscription shared across Redux + SyncManager listeners.
 * Avoids duplicate native listeners for the same connectivity stream.
 */
export function createConnectivityService(): ConnectivityService {
  const listeners = new Set<(snapshot: NetworkSnapshot) => void>();
  let stopNetInfo: (() => void) | null = null;
  let lastSnapshot: NetworkSnapshot | null = null;

  function ensureNativeListener(): void {
    if (stopNetInfo) {
      return;
    }

    stopNetInfo = NetInfo.addEventListener(state => {
      lastSnapshot = mapNetInfoState(state);
      listeners.forEach(listener => {
        listener(lastSnapshot!);
      });
    });
  }

  function maybeStopNativeListener(): void {
    if (listeners.size > 0 || !stopNetInfo) {
      return;
    }

    stopNetInfo();
    stopNetInfo = null;
    lastSnapshot = null;
  }

  return {
    async getStatus() {
      const state = await NetInfo.fetch();
      lastSnapshot = mapNetInfoState(state);
      return lastSnapshot;
    },

    subscribe(listener) {
      listeners.add(listener);
      ensureNativeListener();

      if (lastSnapshot) {
        listener(lastSnapshot);
      } else {
        NetInfo.fetch()
          .then(state => {
            if (!listeners.has(listener)) {
              return;
            }
            lastSnapshot = mapNetInfoState(state);
            listener(lastSnapshot);
          })
          .catch(() => undefined);
      }

      return () => {
        listeners.delete(listener);
        maybeStopNativeListener();
      };
    },
  };
}
