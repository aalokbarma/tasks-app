import type {
  BatchQueryCommand,
  QueryResult,
  QueryResultRow,
  SQLiteQueryParams,
  Transaction,
} from 'react-native-nitro-sqlite';

import {DatabaseError} from './errors';
import type {Migration} from './migrations/types';

/**
 * Database abstraction used by repositories.
 * Keeps react-native-nitro-sqlite details out of feature code.
 */
export interface DatabaseClient {
  open(): Promise<void>;
  close(): Promise<void>;
  isOpen(): boolean;
  migrate(migrations: readonly Migration[]): Promise<void>;
  executeAsync<Row extends QueryResultRow = QueryResultRow>(
    query: string,
    params?: SQLiteQueryParams,
  ): Promise<QueryResult<Row>>;
  executeBatchAsync(commands: BatchQueryCommand[]): Promise<void>;
  transaction<Result>(
    callback: (tx: Transaction) => Promise<Result>,
  ): Promise<Result>;
}

let client: DatabaseClient | null = null;

export function setDatabaseClient(nextClient: DatabaseClient): void {
  client = nextClient;
}

export function getDatabaseClient(): DatabaseClient {
  if (!client) {
    throw new DatabaseError(
      'DatabaseClient has not been registered. Call initializeDatabase() during app bootstrap.',
    );
  }

  return client;
}

export function resetDatabaseClientForTests(): void {
  client = null;
}
