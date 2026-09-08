import {DatabaseError} from '@database/errors';
import {AppFirebaseError} from '@services/firebase/errors';

import {DATABASE_USER_MESSAGES, FIREBASE_USER_MESSAGES} from './messages';

/**
 * Maps any thrown value to a safe, user-facing message.
 * Never returns raw Firebase / SQLite / SDK strings.
 */
export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof AppFirebaseError) {
    return FIREBASE_USER_MESSAGES[error.code] ?? fallback;
  }

  if (error instanceof DatabaseError) {
    // Instance message is curated (mapDatabaseError) or intentional UI copy.
    return error.message || DATABASE_USER_MESSAGES[error.code] || fallback;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('signed in') || message.includes('must be signed')) {
      return 'You must be signed in to continue.';
    }

    if (message.includes('network') || message.includes('offline')) {
      return 'Network problem. Check your connection and try again.';
    }
  }

  return fallback;
}

export function toSyncUserMessage(error: unknown): string {
  return toUserMessage(
    error,
    'Sync failed. Your changes are saved on this device and will retry.',
  );
}

export {DATABASE_USER_MESSAGES, FIREBASE_USER_MESSAGES} from './messages';
