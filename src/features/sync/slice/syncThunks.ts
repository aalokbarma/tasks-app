import {createAsyncThunk} from '@reduxjs/toolkit';

import {
  requireSyncQueueRepository,
  requireSyncManager,
} from '@store/dependencies';
import {toSyncUserMessage, toUserMessage} from '@utils/errors';

export const refreshPendingSyncCount = createAsyncThunk<
  number,
  void,
  {rejectValue: string}
>('sync/refreshPendingCount', async (_, {rejectWithValue}) => {
  try {
    return await requireSyncQueueRepository().countPending();
  } catch (error) {
    return rejectWithValue(
      toUserMessage(error, 'Failed to refresh pending sync count.'),
    );
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
    return rejectWithValue(toSyncUserMessage(error));
  }
});
