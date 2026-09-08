import {DATABASE_NAME} from '@config/constants';

import {
  getDatabaseClient,
  setDatabaseClient,
  type DatabaseClient,
} from './client';
import {createNitroSqliteDatabaseClient} from './connection';
import {migrations} from './migrations';

let initializing: Promise<DatabaseClient> | null = null;

/**
 * Opens SQLite, applies migrations, and registers the singleton client.
 * Safe to call multiple times — subsequent calls reuse the same client.
 */
export async function initializeDatabase(
  dbName: string = DATABASE_NAME,
): Promise<DatabaseClient> {
  try {
    return getDatabaseClient();
  } catch {
    // Not registered yet.
  }

  if (initializing) {
    return initializing;
  }

  initializing = (async () => {
    const client = createNitroSqliteDatabaseClient(dbName);
    await client.open();
    await client.migrate(migrations);
    setDatabaseClient(client);
    return client;
  })();

  try {
    return await initializing;
  } finally {
    initializing = null;
  }
}
