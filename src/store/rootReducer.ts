import {combineReducers} from '@reduxjs/toolkit';

import {authReducer} from '@features/auth/slice/authSlice';
import {tasksReducer} from '@features/tasks/slice/tasksSlice';
import {syncReducer} from '@features/sync/slice/syncSlice';

import {themeReducer} from './themeSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
  sync: syncReducer,
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
