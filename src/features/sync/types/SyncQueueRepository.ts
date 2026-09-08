import type {SyncQueueItem} from '../types/sync.types';
import type {UniqueId} from '@app-types/common';

export interface SyncQueueRepository {
  enqueue(
    item: Omit<SyncQueueItem, 'id' | 'attempts' | 'lastError' | 'createdAt'> & {
      id?: UniqueId;
    },
  ): Promise<SyncQueueItem>;
  listPending(limit: number): Promise<SyncQueueItem[]>;
  markAttempt(id: UniqueId, errorMessage: string | null): Promise<void>;
  remove(id: UniqueId): Promise<void>;
  /** Removes queue rows after successful remote sync. */
  markSynchronized(ids: readonly UniqueId[]): Promise<void>;
  countPending(): Promise<number>;
}
