import type {Migration} from './migrations/types';

/**
 * Database client boundary. Implementation will use react-native-nitro-sqlite.
 */
export interface DatabaseClient {
  open(): Promise<void>;
  close(): Promise<void>;
  migrate(migrations: readonly Migration[]): Promise<void>;
  isOpen(): boolean;
}

let client: DatabaseClient | null = null;

export function setDatabaseClient(nextClient: DatabaseClient): void {
  client = nextClient;
}

export function getDatabaseClient(): DatabaseClient {
  if (!client) {
    throw new Error(
      'DatabaseClient has not been registered. Call setDatabaseClient during app bootstrap.',
    );
  }

  return client;
}
