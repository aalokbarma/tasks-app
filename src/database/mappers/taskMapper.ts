import type {SyncStatus} from '@app-types/common';
import type {Task} from '@features/tasks/types';

import type {TaskRow, TaskSyncStatusColumn} from '../schema';
import {DatabaseError} from '../errors';

const SYNC_STATUSES: readonly SyncStatus[] = [
  'synced',
  'created',
  'updated',
  'deleted',
  'pending',
] as const;

export function isSyncStatus(value: string): value is SyncStatus {
  return (SYNC_STATUSES as readonly string[]).includes(value);
}

export function mapTaskRowToTask(row: TaskRow): Task {
  if (!isSyncStatus(row.sync_status)) {
    throw new DatabaseError(
      `Invalid sync_status "${row.sync_status}" for task ${row.id}.`,
    );
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    dueAt: row.due_at,
    reminderAt: row.reminder_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status,
  };
}

export function mapTaskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    user_id: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed ? 1 : 0,
    due_at: task.dueAt,
    reminder_at: task.reminderAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt,
    sync_status: task.syncStatus as TaskSyncStatusColumn,
  };
}

/**
 * Preserves "created" until the first successful remote create sync.
 */
export function nextSyncStatusAfterLocalUpdate(
  current: SyncStatus,
): SyncStatus {
  if (current === 'created') {
    return 'created';
  }

  if (current === 'deleted') {
    return 'deleted';
  }

  return 'updated';
}
