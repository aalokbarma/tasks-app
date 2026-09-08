import type {Migration} from './types';

/**
 * Initial offline-first schema.
 * Column `due_at` stores the task due date (domain field: dueAt / dueDate).
 */
export const migration001InitialSchema: Migration = {
  version: 1,
  name: '001_initial_schema',
  statements: [
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      due_at TEXT,
      reminder_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      CHECK (completed IN (0, 1)),
      CHECK (
        sync_status IN ('synced', 'created', 'updated', 'deleted', 'pending')
      )
    );`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_user_id
      ON tasks (user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_user_sync
      ON tasks (user_id, sync_status);`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_user_updated
      ON tasks (user_id, updated_at DESC);`,
    `CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload_json TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL,
      CHECK (entity_type IN ('task')),
      CHECK (operation IN ('create', 'update', 'delete'))
    );`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_created
      ON sync_queue (created_at ASC);`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_entity
      ON sync_queue (entity_type, entity_id);`,
  ],
};
