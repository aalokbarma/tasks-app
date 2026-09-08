import type {UniqueId} from '@app-types/common';

import type {Task} from '../types/task.types';

/**
 * Remote task transport contract.
 * Keeps Firestore out of the tasks feature module.
 */
export interface TaskRemoteDataSource {
  fetchAll(userId: UniqueId): Promise<Task[]>;
  upsert(userId: UniqueId, task: Task): Promise<void>;
  remove(userId: UniqueId, taskId: UniqueId): Promise<void>;
}
