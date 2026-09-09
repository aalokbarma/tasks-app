import {createAsyncThunk} from '@reduxjs/toolkit';

import {
  requireSyncQueueRepository,
  requireSyncManager,
} from '@store/dependencies';
import {reportError, toSyncUserMessage, toUserMessage} from '@utils/errors';

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

/**
 * Fire-and-forget debounced sync after local writes. Safe if the manager
 * is not ready yet (bootstrap race) — reconnect / start will pick up the queue.
 */
export function requestAutomaticSynchronization(): void {
  try {
    requireSyncManager().scheduleFlush();
  } catch (error) {
    reportError('sync/schedule', error);
  }
}
