export type {DatabaseClient} from './client';
export {
  getDatabaseClient,
  resetDatabaseClientForTests,
  setDatabaseClient,
} from './client';
export {
  createNitroSqliteDatabaseClient,
  NitroSqliteDatabaseClient,
} from './connection';
export {DatabaseError} from './errors';
export {initializeDatabase} from './initialize';
export {migrations} from './migrations';
export type {Migration} from './migrations/types';
export {
  mapTaskRowToTask,
  mapTaskToRow,
  nextSyncStatusAfterLocalUpdate,
} from './mappers/taskMapper';
export {mapSyncQueueRowToItem} from './mappers/syncQueueMapper';
export {createSqliteSyncQueueRepository} from './repositories/SqliteSyncQueueRepository';
export {createSqliteTaskRepository} from './repositories/SqliteTaskRepository';
export {SCHEMA_VERSION} from './schema';
export type {
  SchemaMigrationRow,
  SyncQueueRow,
  TaskRow,
  TaskSyncStatusColumn,
} from './schema';
