import {
  AppFirebaseError,
  mapAuthError,
  mapFirestoreError,
} from '@services/firebase/errors';
import {
  __resetFirebaseAppForTests,
  initializeFirebaseApp,
} from '@services/firebase/app';

describe('Firebase infrastructure', () => {
  beforeEach(() => {
    __resetFirebaseAppForTests();
  });

  it('maps auth errors to typed AppFirebaseError codes', () => {
    const mapped = mapAuthError({
      code: 'auth/wrong-password',
      message: 'Wrong password.',
    });

    expect(mapped).toBeInstanceOf(AppFirebaseError);
    expect(mapped.code).toBe('auth/wrong-password');
    expect(mapped.message).toBe('Wrong password.');
  });

  it('maps firestore permission errors', () => {
    const mapped = mapFirestoreError({
      code: 'firestore/permission-denied',
      message: 'Missing permissions.',
    });

    expect(mapped.code).toBe('firestore/permission-denied');
  });

  it('initializes once and returns an unconfigured handle without native apps', () => {
    const first = initializeFirebaseApp();
    const second = initializeFirebaseApp();

    expect(first.ready).toBe(false);
    expect(second).toBe(first);
  });
});
