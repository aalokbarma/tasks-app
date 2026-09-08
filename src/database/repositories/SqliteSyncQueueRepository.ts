import type {SyncQueueRepository} from '@features/sync/types';
import {notImplemented} from '@utils/notImplemented';

export function createSqliteSyncQueueRepository(): SyncQueueRepository {
  return {
    enqueue: () => notImplemented('SqliteSyncQueueRepository.enqueue'),
    listPending: () => notImplemented('SqliteSyncQueueRepository.listPending'),
    markAttempt: () => notImplemented('SqliteSyncQueueRepository.markAttempt'),
    remove: () => notImplemented('SqliteSyncQueueRepository.remove'),
    countPending: () =>
      notImplemented('SqliteSyncQueueRepository.countPending'),
  };
}
