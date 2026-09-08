import type {UniqueId} from '@app-types/common';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@features/tasks/types';
import {createId} from '@utils/id';
import {toISODateString} from '@utils/date';

import type {DatabaseClient} from '../client';
import {getDatabaseClient} from '../client';
import {DatabaseError} from '../errors';
import {
  mapTaskRowToTask,
  mapTaskToRow,
  nextSyncStatusAfterLocalUpdate,
} from '../mappers/taskMapper';
import type {TaskRow} from '../schema';
import {enqueueTaskSyncOperation} from './SqliteSyncQueueRepository';

function buildPendingPayload(task: Task): string {
  return JSON.stringify(task);
}

async function getTaskRow(
  client: DatabaseClient,
  userId: UniqueId,
  taskId: UniqueId,
): Promise<TaskRow | null> {
  const result = await client.executeAsync<TaskRow>(
    `SELECT id, user_id, title, description, completed, due_at, reminder_at,
            created_at, updated_at, deleted_at, sync_status
     FROM tasks
     WHERE id = ? AND user_id = ?
     LIMIT 1;`,
    [taskId, userId],
  );

  return result.rows.item(0) ?? null;
}

export function createSqliteTaskRepository(
  client: DatabaseClient = getDatabaseClient(),
): TaskRepository {
  const repository: TaskRepository = {
    async getAll(userId, filters) {
      const clauses = ['user_id = ?'];
      const params: Array<string | number> = [userId];

      if (!filters?.includeDeleted) {
        clauses.push('deleted_at IS NULL');
      }

      if (typeof filters?.completed === 'boolean') {
        clauses.push('completed = ?');
        params.push(filters.completed ? 1 : 0);
      }

      const result = await client.executeAsync<TaskRow>(
        `SELECT id, user_id, title, description, completed, due_at, reminder_at,
                created_at, updated_at, deleted_at, sync_status
         FROM tasks
         WHERE ${clauses.join(' AND ')}
         ORDER BY updated_at DESC;`,
        params,
      );

      return result.rows._array.map(mapTaskRowToTask);
    },

    async getById(userId, taskId) {
      const row = await getTaskRow(client, userId, taskId);
      return row ? mapTaskRowToTask(row) : null;
    },

    async create(userId, input: CreateTaskInput) {
      const now = toISODateString();
      const task: Task = {
        id: createId(),
        userId,
        title: input.title.trim(),
        description: input.description ?? null,
        completed: false,
        dueAt: input.dueAt ?? null,
        reminderAt: input.reminderAt ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        syncStatus: 'created',
      };

      if (!task.title) {
        throw new DatabaseError('Task title is required.');
      }

      const row = mapTaskToRow(task);

      await client.transaction(async tx => {
        await tx.executeAsync(
          `INSERT INTO tasks (
            id, user_id, title, description, completed, due_at, reminder_at,
            created_at, updated_at, deleted_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            row.id,
            row.user_id,
            row.title,
            row.description,
            row.completed,
            row.due_at,
            row.reminder_at,
            row.created_at,
            row.updated_at,
            row.deleted_at,
            row.sync_status,
          ],
        );

        await enqueueTaskSyncOperation(tx, {
          entityId: task.id,
          operation: 'create',
          payloadJson: buildPendingPayload(task),
        });
      });

      return task;
    },

    async update(userId, input: UpdateTaskInput) {
      const existingRow = await getTaskRow(client, userId, input.id);
      if (!existingRow) {
        throw new DatabaseError(`Task "${input.id}" was not found.`);
      }

      const existing = mapTaskRowToTask(existingRow);
      if (existing.deletedAt) {
        throw new DatabaseError(`Task "${input.id}" is deleted.`);
      }

      const updated: Task = {
        ...existing,
        title:
          input.title !== undefined ? input.title.trim() : existing.title,
        description:
          input.description !== undefined
            ? input.description
            : existing.description,
        completed:
          input.completed !== undefined ? input.completed : existing.completed,
        dueAt: input.dueAt !== undefined ? input.dueAt : existing.dueAt,
        reminderAt:
          input.reminderAt !== undefined
            ? input.reminderAt
            : existing.reminderAt,
        updatedAt: toISODateString(),
        syncStatus: nextSyncStatusAfterLocalUpdate(existing.syncStatus),
      };

      if (!updated.title) {
        throw new DatabaseError('Task title is required.');
      }

      const row = mapTaskToRow(updated);

      await client.transaction(async tx => {
        await tx.executeAsync(
          `UPDATE tasks
           SET title = ?, description = ?, completed = ?, due_at = ?, reminder_at = ?,
               updated_at = ?, sync_status = ?
           WHERE id = ? AND user_id = ?;`,
          [
            row.title,
            row.description,
            row.completed,
            row.due_at,
            row.reminder_at,
            row.updated_at,
            row.sync_status,
            row.id,
            row.user_id,
          ],
        );

        await enqueueTaskSyncOperation(tx, {
          entityId: updated.id,
          operation: existing.syncStatus === 'created' ? 'create' : 'update',
          payloadJson: buildPendingPayload(updated),
        });
      });

      return updated;
    },

    async delete(userId, taskId) {
      const existingRow = await getTaskRow(client, userId, taskId);
      if (!existingRow) {
        throw new DatabaseError(`Task "${taskId}" was not found.`);
      }

      const existing = mapTaskRowToTask(existingRow);
      if (existing.deletedAt) {
        return;
      }

      const now = toISODateString();
      const deleted: Task = {
        ...existing,
        deletedAt: now,
        updatedAt: now,
        syncStatus: 'deleted',
      };

      await client.transaction(async tx => {
        await tx.executeAsync(
          `UPDATE tasks
           SET deleted_at = ?, updated_at = ?, sync_status = ?
           WHERE id = ? AND user_id = ?;`,
          [deleted.deletedAt, deleted.updatedAt, deleted.syncStatus, taskId, userId],
        );

        // Never-synced local creates can be removed from the outbox entirely.
        if (existing.syncStatus === 'created') {
          await tx.executeAsync(
            `DELETE FROM sync_queue WHERE entity_type = 'task' AND entity_id = ?;`,
            [taskId],
          );
          await tx.executeAsync(
            `DELETE FROM tasks WHERE id = ? AND user_id = ?;`,
            [taskId, userId],
          );
          return;
        }

        await enqueueTaskSyncOperation(tx, {
          entityId: taskId,
          operation: 'delete',
          payloadJson: buildPendingPayload(deleted),
        });
      });
    },

    async setCompleted(userId, taskId, completed) {
      return repository.update(userId, {id: taskId, completed});
    },

    async upsertMany(userId, tasks) {
      if (tasks.length === 0) {
        return;
      }

      await client.transaction(async tx => {
        for (const task of tasks) {
          if (task.userId !== userId) {
            throw new DatabaseError(
              `Task "${task.id}" does not belong to user "${userId}".`,
            );
          }

          const row = mapTaskToRow(task);
          await tx.executeAsync(
            `INSERT INTO tasks (
              id, user_id, title, description, completed, due_at, reminder_at,
              created_at, updated_at, deleted_at, sync_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              description = excluded.description,
              completed = excluded.completed,
              due_at = excluded.due_at,
              reminder_at = excluded.reminder_at,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              sync_status = excluded.sync_status
            WHERE tasks.user_id = excluded.user_id;`,
            [
              row.id,
              row.user_id,
              row.title,
              row.description,
              row.completed,
              row.due_at,
              row.reminder_at,
              row.created_at,
              row.updated_at,
              row.deleted_at,
              row.sync_status,
            ],
          );
        }
      });
    },

    async getPendingSync(userId) {
      const result = await client.executeAsync<TaskRow>(
        `SELECT id, user_id, title, description, completed, due_at, reminder_at,
                created_at, updated_at, deleted_at, sync_status
         FROM tasks
         WHERE user_id = ?
           AND sync_status IN ('created', 'updated', 'deleted', 'pending')
         ORDER BY updated_at ASC;`,
        [userId],
      );

      return result.rows._array.map(mapTaskRowToTask);
    },

    async markSynchronized(userId, taskIds) {
      if (taskIds.length === 0) {
        return;
      }

      const placeholders = taskIds.map(() => '?').join(', ');

      await client.transaction(async tx => {
        await tx.executeAsync(
          `UPDATE tasks
           SET sync_status = 'synced'
           WHERE user_id = ?
             AND id IN (${placeholders});`,
          [userId, ...taskIds],
        );

        await tx.executeAsync(
          `DELETE FROM sync_queue
           WHERE entity_type = 'task'
             AND entity_id IN (${placeholders});`,
          [...taskIds],
        );
      });
    },
  };

  return repository;
}
