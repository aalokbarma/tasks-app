import {configureStore} from '@reduxjs/toolkit';

import {createAuthRepository} from '@features/auth/services/createAuthRepository';
import {
  authReducer,
  clearAuthError,
  resetAuthState,
  setAuthError,
  setAuthUser,
} from '@features/auth/slice/authSlice';
import {
  hydrateAuthSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '@features/auth/slice/authThunks';
import {AppFirebaseError} from '@services/firebase/errors';

import {createFakeAuthService} from './helpers/memoryFakes';

jest.mock('@store/dependencies', () => {
  const actual = jest.requireActual('@store/dependencies');
  return {
    ...actual,
    requireAuthRepository: jest.fn(),
  };
});

jest.mock('@features/tasks/slice/tasksSlice', () => ({
  resetTasksState: () => ({type: 'tasks/resetTasksState'}),
}));

jest.mock('@features/sync/slice/syncSlice', () => ({
  resetSyncState: () => ({type: 'sync/resetSyncState'}),
}));

const {requireAuthRepository} = jest.requireMock('@store/dependencies') as {
  requireAuthRepository: jest.Mock;
};

function createAuthStore() {
  return configureStore({
    reducer: {auth: authReducer},
  });
}

describe('createAuthRepository (no Firebase)', () => {
  it('signs in successfully with normalized email', async () => {
    const service = createFakeAuthService({
      users: [
        {
          email: 'ada@example.com',
          password: 'secret12',
          user: {
            uid: 'u1',
            email: 'ada@example.com',
            displayName: 'Ada',
          },
        },
      ],
    });
    const repo = createAuthRepository(service);

    const user = await repo.signIn({
      email: '  Ada@Example.com ',
      password: 'secret12',
    });

    expect(user.uid).toBe('u1');
    expect(service.signInCalls[0]?.email).toBe('ada@example.com');
  });

  it('fails login with curated auth error (not raw SDK text)', async () => {
    const service = createFakeAuthService();
    const repo = createAuthRepository(service);

    await expect(
      repo.signIn({email: 'missing@example.com', password: 'secret12'}),
    ).rejects.toBeInstanceOf(AppFirebaseError);

    await expect(
      repo.signIn({email: 'missing@example.com', password: 'secret12'}),
    ).rejects.toMatchObject({
      code: 'auth/invalid-credential',
      message: 'Incorrect email or password.',
    });
  });

  it('rejects invalid credentials before calling the auth service', async () => {
    const service = createFakeAuthService();
    const repo = createAuthRepository(service);

    await expect(
      repo.signIn({email: 'not-an-email', password: 'secret12'}),
    ).rejects.toThrow(/valid email/i);
    expect(service.signInCalls).toHaveLength(0);
  });

  it('signs up successfully', async () => {
    const service = createFakeAuthService();
    const repo = createAuthRepository(service);

    const user = await repo.signUp({
      email: 'new@example.com',
      password: 'secret12',
      displayName: 'New User',
    });

    expect(user.email).toBe('new@example.com');
    expect(user.displayName).toBe('New User');
    expect(service.currentUser?.uid).toBe(user.uid);
  });

  it('fails signup when email is already registered', async () => {
    const service = createFakeAuthService({
      users: [
        {
          email: 'taken@example.com',
          password: 'secret12',
          user: {
            uid: 'u1',
            email: 'taken@example.com',
            displayName: null,
          },
        },
      ],
    });
    const repo = createAuthRepository(service);

    await expect(
      repo.signUp({
        email: 'taken@example.com',
        password: 'secret12',
        displayName: 'Other',
      }),
    ).rejects.toMatchObject({
      code: 'auth/email-already-in-use',
    });
  });
});

describe('auth state transitions', () => {
  beforeEach(() => {
    requireAuthRepository.mockReset();
  });

  it('hydrates an authenticated session', async () => {
    requireAuthRepository.mockReturnValue({
      getCurrentSession: async () => ({
        status: 'authenticated',
        user: {uid: 'u1', email: 'a@b.com', displayName: null},
        errorMessage: null,
      }),
    });

    const store = createAuthStore();
    await store.dispatch(hydrateAuthSession());

    expect(store.getState().auth.status).toBe('authenticated');
    expect(store.getState().auth.user?.uid).toBe('u1');
  });

  it('transitions unknown → authenticating → authenticated on login success', async () => {
    requireAuthRepository.mockReturnValue({
      signIn: async () => ({
        uid: 'u1',
        email: 'a@b.com',
        displayName: 'Ada',
      }),
    });

    const store = createAuthStore();
    const pending = store.dispatch(
      signInWithEmail({email: 'a@b.com', password: 'secret12'}),
    );
    expect(store.getState().auth.isAuthenticating).toBe(true);

    await pending;

    expect(store.getState().auth).toMatchObject({
      status: 'authenticated',
      isAuthenticating: false,
      rememberedEmail: 'a@b.com',
      errorMessage: null,
    });
  });

  it('transitions to error on login failure without leaving a user', async () => {
    requireAuthRepository.mockReturnValue({
      signIn: async () => {
        throw new AppFirebaseError(
          'auth/wrong-password',
          'Incorrect email or password.',
        );
      },
    });

    const store = createAuthStore();
    await store.dispatch(
      signInWithEmail({email: 'a@b.com', password: 'bad-pass'}),
    );

    expect(store.getState().auth.status).toBe('error');
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.errorMessage).toBe(
      'Incorrect email or password.',
    );
    expect(store.getState().auth.isAuthenticating).toBe(false);
  });

  it('transitions to authenticated on signup success', async () => {
    requireAuthRepository.mockReturnValue({
      signUp: async () => ({
        uid: 'u2',
        email: 'new@example.com',
        displayName: 'New',
      }),
    });

    const store = createAuthStore();
    await store.dispatch(
      signUpWithEmail({
        email: 'new@example.com',
        password: 'secret12',
        displayName: 'New',
      }),
    );

    expect(store.getState().auth.status).toBe('authenticated');
    expect(store.getState().auth.user?.uid).toBe('u2');
  });

  it('keeps unauthenticated user null on signup failure', async () => {
    requireAuthRepository.mockReturnValue({
      signUp: async () => {
        throw new AppFirebaseError(
          'auth/email-already-in-use',
          'An account with this email already exists.',
        );
      },
    });

    const store = createAuthStore();
    await store.dispatch(
      signUpWithEmail({
        email: 'taken@example.com',
        password: 'secret12',
      }),
    );

    expect(store.getState().auth.status).toBe('error');
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.errorMessage).toContain('already exists');
  });

  it('signs out to unauthenticated and clears error recovery path', async () => {
    requireAuthRepository.mockReturnValue({
      signOut: async () => undefined,
    });

    const store = createAuthStore();
    store.dispatch(
      setAuthUser({uid: 'u1', email: 'a@b.com', displayName: null}),
    );
    store.dispatch(setAuthError('stale'));
    expect(store.getState().auth.status).toBe('error');

    store.dispatch(clearAuthError());
    expect(store.getState().auth.status).toBe('authenticated');

    await store.dispatch(signOutUser());
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(store.getState().auth.user).toBeNull();

    store.dispatch(resetAuthState());
    expect(store.getState().auth.status).toBe('unknown');
  });
});
