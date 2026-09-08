import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from '@react-native-firebase/auth';

import type {
  AuthCredentials,
  AuthService,
  AuthSession,
  AuthUser,
  SignUpInput,
} from '@features/auth/types';

import {getFirebaseAppHandle} from './app';
import {
  AppFirebaseError,
  ensureFirebaseReady,
  mapAuthError,
} from './errors';
import {
  mapFirebaseUserToAuthUser,
  mapFirebaseUserToAuthUserOrNull,
} from './mappers/authMapper';

function toSession(
  user: User | null,
  errorMessage: string | null = null,
): AuthSession {
  return {
    status: user ? 'authenticated' : 'unauthenticated',
    user: mapFirebaseUserToAuthUserOrNull(user),
    errorMessage,
  };
}

async function updateDisplayNameIfNeeded(
  user: User,
  displayName: string | undefined,
): Promise<AuthUser> {
  if (!displayName || displayName.trim().length === 0) {
    return mapFirebaseUserToAuthUser(user);
  }

  await updateProfile(user, {displayName: displayName.trim()});

  const refreshed = getAuth().currentUser;
  if (!refreshed) {
    throw new AppFirebaseError(
      'auth/unknown',
      'Sign-in failed. Please try again.',
    );
  }

  return mapFirebaseUserToAuthUser(refreshed);
}

export function createFirebaseAuthService(): AuthService {
  return {
    async getCurrentSession(): Promise<AuthSession> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        return toSession(getAuth().currentUser);
      } catch (error) {
        const mapped = mapAuthError(error);
        return {
          status: 'error',
          user: null,
          errorMessage: mapped.message,
        };
      }
    },

    async signIn(credentials: AuthCredentials): Promise<AuthUser> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        const credential = await signInWithEmailAndPassword(
          getAuth(),
          credentials.email.trim(),
          credentials.password,
        );
        return mapFirebaseUserToAuthUser(credential.user);
      } catch (error) {
        throw mapAuthError(error);
      }
    },

    async signUp(input: SignUpInput): Promise<AuthUser> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        const credential = await createUserWithEmailAndPassword(
          getAuth(),
          input.email.trim(),
          input.password,
        );
        return await updateDisplayNameIfNeeded(
          credential.user,
          input.displayName,
        );
      } catch (error) {
        throw mapAuthError(error);
      }
    },

    async signOut(): Promise<void> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        await signOut(getAuth());
      } catch (error) {
        throw mapAuthError(error);
      }
    },

    subscribe(listener: (session: AuthSession) => void): () => void {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
      } catch (error) {
        const mapped = mapAuthError(error);
        listener({
          status: 'error',
          user: null,
          errorMessage: mapped.message,
        });
        return () => undefined;
      }

      return onAuthStateChanged(getAuth(), user => {
        listener(toSession(user));
      });
    },
  };
}
