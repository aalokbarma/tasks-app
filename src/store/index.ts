import {configureStore} from '@reduxjs/toolkit';

import {rootReducer} from './rootReducer';

export function createAppStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: true,
      }),
    devTools: __DEV__,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = createAppStore();
