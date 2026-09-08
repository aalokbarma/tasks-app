import type {SyncOperation, UniqueId} from '@app-types/common';
import type {SyncQueueItem} from '@features/sync/types';

import {DatabaseError} from '../errors';
import type {SyncQueueRow} from '../schema';

function isSyncOperation(value: string): value is SyncOperation {
  return value === 'create' || value === 'update' || value === 'delete';
}

export function mapSyncQueueRowToItem(row: SyncQueueRow): SyncQueueItem {
  if (row.entity_type !== 'task') {
    throw new DatabaseError(
      `Unsupported sync queue entity_type "${row.entity_type}".`,
    );
  }

  if (!isSyncOperation(row.operation)) {
    throw new DatabaseError(
      `Unsupported sync queue operation "${row.operation}".`,
    );
  }

  return {
    id: row.id as UniqueId,
    entityType: 'task',
    entityId: row.entity_id as UniqueId,
    operation: row.operation,
    payloadJson: row.payload_json,
    attempts: Number(row.attempts),
    lastError: row.last_error,
    createdAt: row.created_at,
  };
}
