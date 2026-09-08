import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {SyncState} from '@features/sync/types';
import type {ISODateString} from '@app-types/common';

import {refreshPendingSyncCount} from './syncThunks';

const initialState: SyncState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
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
    setFailedCount(state, action: PayloadAction<number>) {
      state.failedCount = action.payload;
    },
    setLastSyncedAt(state, action: PayloadAction<ISODateString | null>) {
      state.lastSyncedAt = action.payload;
    },
    setSyncError(state, action: PayloadAction<string | null>) {
      state.lastError = action.payload;
      if (action.payload === null) {
        state.failedCount = 0;
      }
    },
    clearSyncFailure(state) {
      state.lastError = null;
      state.failedCount = 0;
    },
    resetSyncState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(refreshPendingSyncCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
        // Do not clear sync failures here — count refresh is independent.
      })
      .addCase(refreshPendingSyncCount.rejected, (state, action) => {
        // Soft failure: keep prior sync error if present.
        if (!state.lastError) {
          state.lastError =
            action.payload ?? 'Failed to refresh pending sync count.';
        }
      });
  },
});

export const {
  setSyncing,
  setPendingCount,
  setFailedCount,
  setLastSyncedAt,
  setSyncError,
  clearSyncFailure,
  resetSyncState,
} = syncSlice.actions;

export const syncReducer = syncSlice.reducer;
