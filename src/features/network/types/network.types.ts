import type {ConnectivityStatus} from '@app-types/common';

export interface NetworkState {
  status: ConnectivityStatus;
  isInternetReachable: boolean | null;
  isMonitoring: boolean;
}
