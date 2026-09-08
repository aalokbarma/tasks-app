import {DATABASE_USER_MESSAGES} from '@utils/errors/messages';
import {reportError} from '@utils/errors/reportError';

export type DatabaseErrorCode =
  | 'open'
  | 'query'
  | 'write'
  | 'migrate'
  | 'corrupt'
  | 'unknown';

/**
 * Local persistence failure with a user-safe `message`.
 * Prefer `mapDatabaseError` for SDK failures; construct directly for
 * intentional validation copy (e.g. empty title).
 */
export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode;
  override readonly cause?: unknown;

  constructor(
    message: string,
    cause?: unknown,
    code: DatabaseErrorCode = 'unknown',
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.cause = cause;
  }
}

export function mapDatabaseError(
  error: unknown,
  fallbackCode: DatabaseErrorCode = 'unknown',
): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }

  const message =
    DATABASE_USER_MESSAGES[fallbackCode] ??
    DATABASE_USER_MESSAGES.unknown ??
    'A local storage error occurred. Please try again.';

  reportError('database', error, {code: fallbackCode});
  return new DatabaseError(message, error, fallbackCode);
}
