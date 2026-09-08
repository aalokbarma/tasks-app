import {FIREBASE_USER_MESSAGES} from '@utils/errors/messages';
import {reportError} from '@utils/errors/reportError';

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

function userMessageFor(code: FirebaseErrorCode): string {
  return (
    FIREBASE_USER_MESSAGES[code] ??
    FIREBASE_USER_MESSAGES.unknown ??
    'Something went wrong. Please try again.'
  );
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
  reportError('firebase/auth', error, {code});
  return new AppFirebaseError(code, userMessageFor(code), error);
}

export function mapFirestoreError(error: unknown): AppFirebaseError {
  if (error instanceof AppFirebaseError) {
    return error;
  }

  const rawCode = readErrorCode(error);
  let code: FirebaseErrorCode = 'firestore/unknown';

  if (rawCode === 'firestore/permission-denied') {
    code = 'firestore/permission-denied';
  } else if (rawCode === 'firestore/not-found') {
    code = 'firestore/not-found';
  } else if (rawCode === 'firestore/unavailable' || rawCode === 'unavailable') {
    code = 'firestore/unavailable';
  }

  reportError('firebase/firestore', error, {code});
  return new AppFirebaseError(code, userMessageFor(code), error);
}

export function mapMessagingError(error: unknown): AppFirebaseError {
  if (error instanceof AppFirebaseError) {
    return error;
  }

  const rawCode = readErrorCode(error);
  let code: FirebaseErrorCode = 'messaging/unknown';

  if (
    rawCode === 'messaging/permission-blocked' ||
    rawCode === 'messaging/permission-denied'
  ) {
    code = 'messaging/permission-denied';
  } else if (rawCode === 'messaging/unavailable') {
    code = 'messaging/unavailable';
  }

  reportError('firebase/messaging', error, {code});
  return new AppFirebaseError(code, userMessageFor(code), error);
}

export function ensureFirebaseReady(isReady: boolean): void {
  if (!isReady) {
    throw new AppFirebaseError('unconfigured', userMessageFor('unconfigured'));
  }
}
