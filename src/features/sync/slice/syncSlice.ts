import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {SyncState} from '@features/sync/types';
import type {ConnectivityStatus, ISODateString} from '@app-types/common';

const initialState: SyncState = {
  connectivity: 'unknown',
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setConnectivity(state, action: PayloadAction<ConnectivityStatus>) {
      state.connectivity = action.payload;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setPendingCount(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
    setLastSyncedAt(state, action: PayloadAction<ISODateString | null>) {
      state.lastSyncedAt = action.payload;
    },
    setSyncError(state, action: PayloadAction<string | null>) {
      state.lastError = action.payload;
    },
    resetSyncState() {
      return initialState;
    },
  },
});

export const {
  setConnectivity,
  setSyncing,
  setPendingCount,
  setLastSyncedAt,
  setSyncError,
  resetSyncState,
} = syncSlice.actions;

export const syncReducer = syncSlice.reducer;
