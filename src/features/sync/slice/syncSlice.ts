import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {SyncState} from '@features/sync/types';
import type {ISODateString} from '@app-types/common';

import {refreshPendingSyncCount} from './syncThunks';

const initialState: SyncState = {
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
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
  extraReducers: builder => {
    builder
      .addCase(refreshPendingSyncCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
        state.lastError = null;
      })
      .addCase(refreshPendingSyncCount.rejected, (state, action) => {
        state.lastError =
          action.payload ?? 'Failed to refresh pending sync count.';
      });
  },
});

export const {
  setSyncing,
  setPendingCount,
  setLastSyncedAt,
  setSyncError,
  resetSyncState,
} = syncSlice.actions;

export const syncReducer = syncSlice.reducer;
