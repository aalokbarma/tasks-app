import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {AuthState, AuthUser} from '@features/auth/types';
import type {AuthStatus} from '@app-types/common';

import {
  hydrateAuthSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from './authThunks';

const initialState: AuthState = {
  status: 'unknown',
  user: null,
  errorMessage: null,
  rememberedEmail: null,
  isAuthenticating: false,
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
      state.isAuthenticating = false;
    },
    setRememberedEmail(state, action: PayloadAction<string | null>) {
      state.rememberedEmail = action.payload;
    },
    clearAuthError(state) {
      state.errorMessage = null;
      if (state.status === 'error') {
        state.status = state.user ? 'authenticated' : 'unauthenticated';
      }
    },
    resetAuthState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateAuthSession.pending, state => {
        state.status = 'unknown';
        state.errorMessage = null;
      })
      .addCase(hydrateAuthSession.fulfilled, (state, action) => {
        state.status = action.payload.status;
        state.user = action.payload.user;
        state.errorMessage = action.payload.errorMessage;
      })
      .addCase(hydrateAuthSession.rejected, (state, action) => {
        state.status = 'error';
        state.errorMessage =
          action.error.message ?? 'Failed to restore authentication session.';
      })
      .addCase(signInWithEmail.pending, state => {
        state.isAuthenticating = true;
        state.errorMessage = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.isAuthenticating = false;
        state.user = action.payload;
        state.status = 'authenticated';
        state.rememberedEmail = action.payload.email;
        state.errorMessage = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.status = 'error';
        state.errorMessage = action.payload ?? 'Sign in failed.';
      })
      .addCase(signUpWithEmail.pending, state => {
        state.isAuthenticating = true;
        state.errorMessage = null;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.isAuthenticating = false;
        state.user = action.payload;
        state.status = 'authenticated';
        state.rememberedEmail = action.payload.email;
        state.errorMessage = null;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.status = 'error';
        state.errorMessage = action.payload ?? 'Sign up failed.';
      })
      .addCase(signOutUser.pending, state => {
        state.isAuthenticating = true;
        state.errorMessage = null;
      })
      .addCase(signOutUser.fulfilled, state => {
        state.user = null;
        state.status = 'unauthenticated';
        state.errorMessage = null;
        state.isAuthenticating = false;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.errorMessage = action.payload ?? 'Sign out failed.';
      });
  },
});

export const {
  setAuthStatus,
  setAuthUser,
  setAuthError,
  setRememberedEmail,
  clearAuthError,
  resetAuthState,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
