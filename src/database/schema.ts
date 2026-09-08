/**
 * SQLite schema contracts.
 * Concrete migrations and SQL will be added with database implementation.
 */

export const SCHEMA_VERSION = 1;

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
  sync_status: string;
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
}
