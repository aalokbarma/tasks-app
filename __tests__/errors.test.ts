import {DatabaseError, mapDatabaseError} from '@database/errors';
import {
  AppFirebaseError,
  mapAuthError,
  mapFirestoreError,
} from '@services/firebase/errors';
import {
  FIREBASE_USER_MESSAGES,
  reportError,
  toSyncUserMessage,
  toUserMessage,
} from '@utils/errors';

describe('error handling strategy', () => {
  it('maps auth SDK errors to curated user copy (never raw SDK text)', () => {
    const mapped = mapAuthError({
      code: 'auth/wrong-password',
      message: 'Wrong password.',
    });

    expect(mapped).toBeInstanceOf(AppFirebaseError);
    expect(mapped.code).toBe('auth/wrong-password');
    expect(mapped.message).toBe(FIREBASE_USER_MESSAGES['auth/wrong-password']);
    expect(mapped.message).not.toContain('Wrong password');
  });

  it('collapses user-not-found into the same login copy as wrong password', () => {
    const mapped = mapAuthError({
      code: 'auth/user-not-found',
      message: 'There is no user record corresponding to this identifier.',
    });

    expect(mapped.message).toBe(FIREBASE_USER_MESSAGES['auth/user-not-found']);
    expect(mapped.message).toBe(FIREBASE_USER_MESSAGES['auth/wrong-password']);
  });

  it('maps firestore permission errors to safe sync copy', () => {
    const mapped = mapFirestoreError({
      code: 'firestore/permission-denied',
      message: 'Missing or insufficient permissions.',
    });

    expect(mapped.code).toBe('firestore/permission-denied');
    expect(mapped.message).toBe(
      FIREBASE_USER_MESSAGES['firestore/permission-denied'],
    );
  });

  it('maps SQLite failures without leaking SQL details', () => {
    const mapped = mapDatabaseError(
      new Error('SQLITE_ERROR: no such table: tasks'),
      'query',
    );

    expect(mapped).toBeInstanceOf(DatabaseError);
    expect(mapped.code).toBe('query');
    expect(mapped.message).not.toContain('SQLITE');
    expect(mapped.message).not.toContain('no such table');
  });

  it('toUserMessage prefers AppFirebaseError curated copy', () => {
    const error = mapAuthError({
      code: 'auth/network-request-failed',
      message: 'A network error has occurred.',
    });

    expect(toUserMessage(error, 'fallback')).toBe(
      FIREBASE_USER_MESSAGES['auth/network-request-failed'],
    );
  });

  it('toSyncUserMessage never returns raw SDK strings', () => {
    const message = toSyncUserMessage(
      new Error('FirebaseError: DEADLINE_EXCEEDED'),
    );

    expect(message).not.toContain('DEADLINE');
    expect(message.toLowerCase()).toContain('sync');
  });

  it('reportError redacts secret-looking meta keys in development', () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    reportError('test', new Error('boom'), {
      password: 'secret-value',
      token: 'abc',
      taskId: 'task-1',
    });

    if (__DEV__) {
      expect(errorSpy).toHaveBeenCalled();
      const meta = errorSpy.mock.calls[0]?.[2] as Record<string, unknown>;
      expect(meta.password).toBe('[redacted]');
      expect(meta.token).toBe('[redacted]');
      expect(meta.taskId).toBe('task-1');
    }

    errorSpy.mockRestore();
  });
});
