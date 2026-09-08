export type FirebaseErrorCode =
  | 'unconfigured'
  | 'unavailable'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/operation-not-allowed'
  | 'auth/unknown'
  | 'firestore/permission-denied'
  | 'firestore/not-found'
  | 'firestore/unavailable'
  | 'firestore/unknown'
  | 'messaging/permission-denied'
  | 'messaging/unavailable'
  | 'messaging/unknown'
  | 'unknown';

export class AppFirebaseError extends Error {
  readonly code: FirebaseErrorCode;
  readonly originalError: unknown;

  constructor(
    code: FirebaseErrorCode,
    message: string,
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'AppFirebaseError';
    this.code = code;
    this.originalError = originalError;
  }
}

function readErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as {code: unknown}).code === 'string'
  ) {
    return (error as {code: string}).code;
  }

  return null;
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as {message: unknown}).message === 'string'
  ) {
    return (error as {message: string}).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

const AUTH_CODE_MAP: Record<string, FirebaseErrorCode> = {
  'auth/invalid-email': 'auth/invalid-email',
  'auth/user-disabled': 'auth/user-disabled',
  'auth/user-not-found': 'auth/user-not-found',
  'auth/wrong-password': 'auth/wrong-password',
  'auth/invalid-credential': 'auth/invalid-credential',
  'auth/email-already-in-use': 'auth/email-already-in-use',
  'auth/weak-password': 'auth/weak-password',
  'auth/too-many-requests': 'auth/too-many-requests',
  'auth/network-request-failed': 'auth/network-request-failed',
  'auth/operation-not-allowed': 'auth/operation-not-allowed',
};

export function mapAuthError(error: unknown): AppFirebaseError {
  if (error instanceof AppFirebaseError) {
    return error;
  }

  const rawCode = readErrorCode(error);
  const code = (rawCode && AUTH_CODE_MAP[rawCode]) || 'auth/unknown';
  const message = readErrorMessage(error, 'Authentication request failed.');

  return new AppFirebaseError(code, message, error);
}

export function mapFirestoreError(error: unknown): AppFirebaseError {
  if (error instanceof AppFirebaseError) {
    return error;
  }

  const rawCode = readErrorCode(error);

  if (rawCode === 'firestore/permission-denied') {
    return new AppFirebaseError(
      'firestore/permission-denied',
      readErrorMessage(error, 'Firestore permission denied.'),
      error,
    );
  }

  if (rawCode === 'firestore/not-found') {
    return new AppFirebaseError(
      'firestore/not-found',
      readErrorMessage(error, 'Firestore document not found.'),
      error,
    );
  }

  if (rawCode === 'firestore/unavailable') {
    return new AppFirebaseError(
      'firestore/unavailable',
      readErrorMessage(error, 'Firestore is temporarily unavailable.'),
      error,
    );
  }

  return new AppFirebaseError(
    'firestore/unknown',
    readErrorMessage(error, 'Firestore request failed.'),
    error,
  );
}

export function mapMessagingError(error: unknown): AppFirebaseError {
  if (error instanceof AppFirebaseError) {
    return error;
  }

  const rawCode = readErrorCode(error);
  const message = readErrorMessage(error, 'Messaging request failed.');

  if (rawCode === 'messaging/permission-blocked') {
    return new AppFirebaseError('messaging/permission-denied', message, error);
  }

  return new AppFirebaseError('messaging/unknown', message, error);
}

export function ensureFirebaseReady(isReady: boolean): void {
  if (!isReady) {
    throw new AppFirebaseError(
      'unconfigured',
      'Firebase is not configured. Add native Firebase config files and set FIREBASE_* environment variables.',
    );
  }
}
