import {createAsyncThunk} from '@reduxjs/toolkit';

import {requireSyncQueueRepository, requireSyncManager} from '@store/dependencies';

export const refreshPendingSyncCount = createAsyncThunk<
  number,
  void,
  {rejectValue: string}
>('sync/refreshPendingCount', async (_, {rejectWithValue}) => {
  try {
    return await requireSyncQueueRepository().countPending();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to refresh pending sync count.';
    return rejectWithValue(message);
  }
});

/**
 * Triggers one sync cycle. Local mutations do not await this — they already
 * succeeded in SQLite. Safe to call repeatedly; SyncManager dedupes concurrency.
 */
export const runSynchronization = createAsyncThunk<
  void,
  void,
  {rejectValue: string}
>('sync/runSynchronization', async (_, {rejectWithValue}) => {
  try {
    await requireSyncManager().flush();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Synchronization failed.';
    return rejectWithValue(message);
  }
});
