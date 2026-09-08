import type {ISODateString, UniqueId} from '@app-types/common';
import type {Task} from '@features/tasks/types';
import {toISODateString} from '@utils/date';

/**
 * Conflict resolution strategy: Last-Write-Wins (LWW) by `updatedAt`.
 *
 * Push runs before pull in every sync cycle so local offline mutations are
 * authoritative until they land remotely. During pull:
 *
 * 1. Never overwrite a dirty local row (`syncStatus !== 'synced'`). Those
 *    records remain the UI source of truth until push succeeds.
 * 2. For synced locals, apply the remote document only when
 *    `remote.updatedAt > local.updatedAt` (strictly newer wins).
 * 3. Remote-only tasks are inserted locally as `synced`.
 * 4. Synced locals missing from Firestore are treated as remote deletes and
 *    tombstoned locally without enqueueing another outbox delete.
 *
 * Equal timestamps keep the local copy (no-op) to stay idempotent.
 */
export function isRemoteNewer(
  remoteUpdatedAt: ISODateString,
  localUpdatedAt: ISODateString,
): boolean {
  return remoteUpdatedAt > localUpdatedAt;
}

export interface ReconcileResult {
  /** Remote (or tombstone) rows to upsert into SQLite. */
  readonly toUpsert: Task[];
}

export function reconcileRemoteTasks(params: {
  userId: UniqueId;
  localTasks: readonly Task[];
  remoteTasks: readonly Task[];
  now?: ISODateString;
}): ReconcileResult {
  const now = params.now ?? toISODateString();
  const localById = new Map(params.localTasks.map(task => [task.id, task]));
  const remoteIds = new Set(params.remoteTasks.map(task => task.id));
  const toUpsert: Task[] = [];

  for (const remote of params.remoteTasks) {
    const local = localById.get(remote.id);

    if (!local) {
      toUpsert.push({
        ...remote,
        userId: params.userId,
        syncStatus: 'synced',
        deletedAt: remote.deletedAt,
      });
      continue;
    }

    // Dirty local rows always win until push clears them.
    if (local.syncStatus !== 'synced') {
      continue;
    }

    if (isRemoteNewer(remote.updatedAt, local.updatedAt)) {
      toUpsert.push({
        ...remote,
        userId: params.userId,
        syncStatus: 'synced',
      });
    }
  }

  for (const local of params.localTasks) {
    if (local.syncStatus !== 'synced') {
      continue;
    }

    if (local.deletedAt) {
      continue;
    }

    if (!remoteIds.has(local.id)) {
      toUpsert.push({
        ...local,
        deletedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      });
    }
  }

  return {toUpsert};
}
