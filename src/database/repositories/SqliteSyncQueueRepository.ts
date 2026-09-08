import type {Transaction} from 'react-native-nitro-sqlite';

import type {SyncOperation, UniqueId} from '@app-types/common';
import type {SyncQueueRepository} from '@features/sync/types';
import type {SyncQueueItem} from '@features/sync/types/sync.types';
import {createId} from '@utils/id';
import {toISODateString} from '@utils/date';

import type {DatabaseClient} from '../client';
import {getDatabaseClient} from '../client';
import {DatabaseError} from '../errors';
import {mapSyncQueueRowToItem} from '../mappers/syncQueueMapper';
import type {SyncQueueRow} from '../schema';

async function insertQueueItem(
  executor: Pick<DatabaseClient, 'executeAsync'> | Transaction,
  item: SyncQueueItem,
): Promise<void> {
  await executor.executeAsync(
    `INSERT INTO sync_queue (
      id, entity_type, entity_id, operation, payload_json, attempts, last_error, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      item.id,
      item.entityType,
      item.entityId,
      item.operation,
      item.payloadJson,
      item.attempts,
      item.lastError,
      item.createdAt,
    ],
  );
}

export function createSqliteSyncQueueRepository(
  client: DatabaseClient = getDatabaseClient(),
): SyncQueueRepository {
  return {
    async enqueue(input) {
      const item: SyncQueueItem = {
        id: input.id ?? createId(),
        entityType: input.entityType,
        entityId: input.entityId,
        operation: input.operation,
        payloadJson: input.payloadJson,
        attempts: 0,
        lastError: null,
        createdAt: toISODateString(),
      };

      await insertQueueItem(client, item);
      return item;
    },

    async listPending(limit) {
      const safeLimit = Math.max(1, Math.floor(limit));
      const result = await client.executeAsync<SyncQueueRow>(
        `SELECT id, entity_type, entity_id, operation, payload_json, attempts, last_error, created_at
         FROM sync_queue
         ORDER BY created_at ASC
         LIMIT ?;`,
        [safeLimit],
      );

      return result.rows._array.map(mapSyncQueueRowToItem);
    },

    async markAttempt(id, errorMessage) {
      const result = await client.executeAsync(
        `UPDATE sync_queue
         SET attempts = attempts + 1,
             last_error = ?
         WHERE id = ?;`,
        [errorMessage, id],
      );

      if ((result.rowsAffected ?? 0) < 1) {
        throw new DatabaseError(`Sync queue item "${id}" was not found.`);
      }
    },

    async remove(id) {
      await client.executeAsync(`DELETE FROM sync_queue WHERE id = ?;`, [id]);
    },

    async markSynchronized(ids) {
      if (ids.length === 0) {
        return;
      }

      const placeholders = ids.map(() => '?').join(', ');
      await client.executeAsync(
        `DELETE FROM sync_queue WHERE id IN (${placeholders});`,
        [...ids],
      );
    },

    async countPending() {
      const result = await client.executeAsync<{count: number}>(
        `SELECT COUNT(*) AS count FROM sync_queue;`,
      );
      const row = result.rows.item(0);
      return Number(row?.count ?? 0);
    },
  };
}

/** Shared helper used inside task repository transactions. */
export async function enqueueTaskSyncOperation(
  tx: Transaction,
  params: {
    entityId: UniqueId;
    operation: SyncOperation;
    payloadJson: string | null;
  },
): Promise<SyncQueueItem> {
  const item: SyncQueueItem = {
    id: createId(),
    entityType: 'task',
    entityId: params.entityId,
    operation: params.operation,
    payloadJson: params.payloadJson,
    attempts: 0,
    lastError: null,
    createdAt: toISODateString(),
  };

  await insertQueueItem(tx, item);
  return item;
}
