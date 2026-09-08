import type {ConnectivityStatus} from '@app-types/common';
import {notImplemented} from '@utils/notImplemented';

export interface ConnectivityService {
  getStatus(): Promise<ConnectivityStatus>;
  subscribe(listener: (status: ConnectivityStatus) => void): () => void;
}

export function createConnectivityService(): ConnectivityService {
  return {
    getStatus: () => notImplemented('ConnectivityService.getStatus'),
    subscribe: () => notImplemented('ConnectivityService.subscribe'),
  };
}
