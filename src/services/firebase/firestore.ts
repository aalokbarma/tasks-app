import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import {notImplemented} from '@utils/notImplemented';

/**
 * Firestore adapter for tasks. Imported by sync composition root only —
 * never by the tasks UI feature module.
 */
export function createFirestoreTaskRemoteDataSource(): TaskRemoteDataSource {
  return {
    fetchAll: () => notImplemented('FirestoreTaskRemoteDataSource.fetchAll'),
    upsert: () => notImplemented('FirestoreTaskRemoteDataSource.upsert'),
    remove: () => notImplemented('FirestoreTaskRemoteDataSource.remove'),
  };
}
