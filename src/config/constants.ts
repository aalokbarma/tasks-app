import type {AppEnvironment} from '@app-types/common';

export const APP_ENVIRONMENTS: readonly AppEnvironment[] = [
  'development',
  'staging',
  'production',
] as const;

export const DATABASE_NAME = 'tasksapp.db';

export const SYNC_QUEUE_BATCH_SIZE = 25;

/** Maximum push attempts per outbox entity before skipping (dead-letter). */
export const SYNC_MAX_ATTEMPTS = 5;
