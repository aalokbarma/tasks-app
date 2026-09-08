import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {ConnectivityStatus} from '@app-types/common';
import type {NetworkState} from '@features/network/types';

import {refreshNetworkStatus} from './networkThunks';

const initialState: NetworkState = {
  status: 'unknown',
  isInternetReachable: null,
  isMonitoring: false,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkStatus(
      state,
      action: PayloadAction<{
        status: ConnectivityStatus;
        isInternetReachable: boolean | null;
      }>,
    ) {
      state.status = action.payload.status;
      state.isInternetReachable = action.payload.isInternetReachable;
    },
    setNetworkMonitoring(state, action: PayloadAction<boolean>) {
      state.isMonitoring = action.payload;
    },
    resetNetworkState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(refreshNetworkStatus.fulfilled, (state, action) => {
      state.status = action.payload.status;
      state.isInternetReachable = action.payload.isInternetReachable;
    });
  },
});

export const {setNetworkStatus, setNetworkMonitoring, resetNetworkState} =
  networkSlice.actions;

export const networkReducer = networkSlice.reducer;
