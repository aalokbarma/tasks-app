import {createAsyncThunk, type Dispatch} from '@reduxjs/toolkit';

import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  SignUpInput,
} from '@features/auth/types';
import {resetSyncState} from '@features/sync/slice/syncSlice';
import {resetTasksState} from '@features/tasks/slice/tasksSlice';
import {requireAuthRepository} from '@store/dependencies';
import {toUserMessage} from '@utils/errors';


/**
 * Clears Redux caches that belong to a signed-in user.
 * Keeps auth preferences like rememberedEmail.
 */
export function clearUserScopedApplicationState(dispatch: Dispatch): void {
  dispatch(resetTasksState());
  dispatch(resetSyncState());
}

export const hydrateAuthSession = createAsyncThunk<AuthSession>(
  'auth/hydrateSession',
  async () => {
    return requireAuthRepository().getCurrentSession();
  },
);

export const signInWithEmail = createAsyncThunk<
  AuthUser,
  AuthCredentials,
  {rejectValue: string}
>('auth/signInWithEmail', async (credentials, {rejectWithValue}) => {
  try {
    return await requireAuthRepository().signIn(credentials);
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Sign in failed. Please try again.'));
  }
});

export const signUpWithEmail = createAsyncThunk<
  AuthUser,
  SignUpInput,
  {rejectValue: string}
>('auth/signUpWithEmail', async (input, {rejectWithValue}) => {
  try {
    return await requireAuthRepository().signUp(input);
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Sign up failed. Please try again.'));
  }
});

export const signOutUser = createAsyncThunk<void, void, {rejectValue: string}>(
  'auth/signOutUser',
  async (_, {dispatch, rejectWithValue}) => {
    try {
      await requireAuthRepository().signOut();
      clearUserScopedApplicationState(dispatch);
    } catch (error) {
      return rejectWithValue(toUserMessage(error, 'Sign out failed. Please try again.'));
    }
  },
);
