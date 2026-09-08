import {combineReducers} from '@reduxjs/toolkit';

import {tasksReducer} from '@features/tasks/slice/tasksSlice';
import {syncReducer} from '@features/sync/slice/syncSlice';
import {networkReducer} from '@features/network/slice/networkSlice';

import {persistedAuthReducer, persistedThemeReducer} from './persist';

export const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  tasks: tasksReducer,
  network: networkReducer,
  sync: syncReducer,
  theme: persistedThemeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
