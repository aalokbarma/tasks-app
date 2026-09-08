import NetInfo, {
  type NetInfoState,
  type NetInfoSubscription,
} from '@react-native-community/netinfo';

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

export function createConnectivityService(): ConnectivityService {
  return {
    async getStatus() {
      const state = await NetInfo.fetch();
      return mapNetInfoState(state);
    },

    subscribe(listener) {
      const subscription: NetInfoSubscription = NetInfo.addEventListener(
        state => {
          listener(mapNetInfoState(state));
        },
      );

      return () => {
        subscription();
      };
    },
  };
}
