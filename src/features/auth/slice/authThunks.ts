import {createAsyncThunk} from '@reduxjs/toolkit';

import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  SignUpInput,
} from '@features/auth/types';
import {AppFirebaseError} from '@services/firebase/errors';

import {requireAuthService} from '@store/dependencies';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppFirebaseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export const hydrateAuthSession = createAsyncThunk<AuthSession>(
  'auth/hydrateSession',
  async () => {
    const authService = requireAuthService();
    return authService.getCurrentSession();
  },
);

export const signInWithEmail = createAsyncThunk<
  AuthUser,
  AuthCredentials,
  {rejectValue: string}
>('auth/signInWithEmail', async (credentials, {rejectWithValue}) => {
  try {
    return await requireAuthService().signIn(credentials);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Sign in failed.'));
  }
});

export const signUpWithEmail = createAsyncThunk<
  AuthUser,
  SignUpInput,
  {rejectValue: string}
>('auth/signUpWithEmail', async (input, {rejectWithValue}) => {
  try {
    return await requireAuthService().signUp(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error, 'Sign up failed.'));
  }
});

export const signOutUser = createAsyncThunk<void, void, {rejectValue: string}>(
  'auth/signOutUser',
  async (_, {rejectWithValue}) => {
    try {
      await requireAuthService().signOut();
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Sign out failed.'));
    }
  },
);
