import {
  open,
  type NitroSQLiteConnection,
  type QueryResult,
  type QueryResultRow,
  type SQLiteQueryParams,
  type BatchQueryCommand,
  type Transaction,
} from 'react-native-nitro-sqlite';

import {DATABASE_NAME} from '@config/constants';
import {toISODateString} from '@utils/date';
import {DATABASE_USER_MESSAGES} from '@utils/errors/messages';

import type {DatabaseClient} from './client';
import {DatabaseError, mapDatabaseError} from './errors';
import type {Migration} from './migrations/types';
import type {SchemaMigrationRow} from './schema';

export class NitroSqliteDatabaseClient implements DatabaseClient {
  private connection: NitroSQLiteConnection | null = null;
  private readonly dbName: string;

  constructor(dbName: string = DATABASE_NAME) {
    this.dbName = dbName;
  }

  isOpen(): boolean {
    return this.connection !== null;
  }

  async open(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      this.connection = open({name: this.dbName});
    } catch (error) {
      throw mapDatabaseError(error, 'open');
    }
  }

  async close(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      this.connection.close();
    } catch (error) {
      throw mapDatabaseError(error, 'open');
    } finally {
      this.connection = null;
    }
  }

  async executeAsync<Row extends QueryResultRow = QueryResultRow>(
    query: string,
    params?: SQLiteQueryParams,
  ): Promise<QueryResult<Row>> {
    const connection = this.requireConnection();

    try {
      return await connection.executeAsync<Row>(query, params);
    } catch (error) {
      throw mapDatabaseError(error, 'query');
    }
  }

  async executeBatchAsync(commands: BatchQueryCommand[]): Promise<void> {
    const connection = this.requireConnection();

    try {
      await connection.executeBatchAsync(commands);
    } catch (error) {
      throw mapDatabaseError(error, 'write');
    }
  }

  async transaction<Result>(
    callback: (tx: Transaction) => Promise<Result>,
  ): Promise<Result> {
    const connection = this.requireConnection();

    try {
      return await connection.transaction(callback);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw mapDatabaseError(error, 'write');
    }
  }

  async migrate(migrationsList: readonly Migration[]): Promise<void> {
    try {
      await this.open();

      await this.executeAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

      const applied = await this.executeAsync<SchemaMigrationRow>(
        'SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;',
      );
      const appliedVersions = new Set(
        applied.rows._array.map(row => Number(row.version)),
      );

      const pending = migrationsList
        .slice()
        .sort((a, b) => a.version - b.version)
        .filter(migration => !appliedVersions.has(migration.version));

      for (const migration of pending) {
        await this.transaction(async tx => {
          for (const statement of migration.statements) {
            await tx.executeAsync(statement);
          }

          await tx.executeAsync(
            `INSERT INTO schema_migrations (version, name, applied_at)
           VALUES (?, ?, ?);`,
            [migration.version, migration.name, toISODateString()],
          );
        });
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError(
          DATABASE_USER_MESSAGES.migrate ??
            'Local storage update failed. Restart the app and try again.',
          error,
          'migrate',
        );
      }
      throw mapDatabaseError(error, 'migrate');
    }
  }

  private requireConnection(): NitroSQLiteConnection {
    if (!this.connection) {
      throw new DatabaseError(
        DATABASE_USER_MESSAGES.open ??
          'Could not open local storage. Restart the app and try again.',
        undefined,
        'open',
      );
    }

    return this.connection;
  }
}

export function createNitroSqliteDatabaseClient(
  dbName?: string,
): DatabaseClient {
  return new NitroSqliteDatabaseClient(dbName);
}
