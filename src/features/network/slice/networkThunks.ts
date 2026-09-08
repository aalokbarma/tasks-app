import {createAsyncThunk} from '@reduxjs/toolkit';

import type {NetworkSnapshot} from '@services/network/connectivity';
import {getConnectivityService} from '@store/dependencies';

export const refreshNetworkStatus = createAsyncThunk<NetworkSnapshot>(
  'network/refreshStatus',
  async () => {
    return getConnectivityService().getStatus();
  },
);
