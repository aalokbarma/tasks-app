import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';

import {authReducer} from '@features/auth/slice/authSlice';
import {themeReducer} from './themeSlice';

/**
 * Persist only lightweight preferences / non-secret auth UX state.
 * Tasks stay in SQLite — never persist the task list here.
 */
export const persistedAuthReducer = persistReducer(
  {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['rememberedEmail'],
    timeout: 0,
  },
  authReducer,
);

export const persistedThemeReducer = persistReducer(
  {
    key: 'theme',
    storage: AsyncStorage,
    whitelist: ['mode'],
    timeout: 0,
  },
  themeReducer,
);
