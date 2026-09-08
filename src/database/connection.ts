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

import type {DatabaseClient} from './client';
import {DatabaseError} from './errors';
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
      throw new DatabaseError(
        `Failed to open SQLite database "${this.dbName}".`,
        error,
      );
    }
  }

  async close(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      this.connection.close();
    } catch (error) {
      throw new DatabaseError(
        `Failed to close SQLite database "${this.dbName}".`,
        error,
      );
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
      throw new DatabaseError('SQLite query failed.', error);
    }
  }

  async executeBatchAsync(commands: BatchQueryCommand[]): Promise<void> {
    const connection = this.requireConnection();

    try {
      await connection.executeBatchAsync(commands);
    } catch (error) {
      throw new DatabaseError('SQLite batch query failed.', error);
    }
  }

  async transaction<Result>(
    callback: (tx: Transaction) => Promise<Result>,
  ): Promise<Result> {
    const connection = this.requireConnection();

    try {
      return await connection.transaction(callback);
    } catch (error) {
      throw new DatabaseError('SQLite transaction failed.', error);
    }
  }

  async migrate(migrationsList: readonly Migration[]): Promise<void> {
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
  }

  private requireConnection(): NitroSQLiteConnection {
    if (!this.connection) {
      throw new DatabaseError(
        'SQLite connection is closed. Call open() before executing queries.',
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
