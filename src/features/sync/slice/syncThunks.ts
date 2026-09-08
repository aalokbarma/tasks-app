import {createAsyncThunk} from '@reduxjs/toolkit';

import {requireSyncQueueRepository} from '@store/dependencies';

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
