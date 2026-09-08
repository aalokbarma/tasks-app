import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {AuthState, AuthUser} from '@features/auth/types';
import type {AuthStatus} from '@app-types/common';

const initialState: AuthState = {
  status: 'unknown',
  user: null,
  errorMessage: null,
  lastSyncedAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      state.errorMessage = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errorMessage = action.payload;
    },
    resetAuthState() {
      return initialState;
    },
  },
});

export const {setAuthStatus, setAuthUser, setAuthError, resetAuthState} =
  authSlice.actions;

export const authReducer = authSlice.reducer;
