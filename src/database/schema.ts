import type {SQLiteValue} from 'react-native-nitro-sqlite';

/**
 * SQLite row contracts (snake_case columns).
 */

export const SCHEMA_VERSION = 1;

export type TaskSyncStatusColumn =
  | 'synced'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'pending';

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: number;
  due_at: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: TaskSyncStatusColumn;
  [key: string]: SQLiteValue;
}

export interface SyncQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload_json: string | null;
  attempts: number;
  last_error: string | null;
  created_at: string;
  [key: string]: SQLiteValue;
}

export interface SchemaMigrationRow {
  version: number;
  name: string;
  applied_at: string;
  [key: string]: SQLiteValue;
}
