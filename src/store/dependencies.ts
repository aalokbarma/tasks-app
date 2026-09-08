import {getAppDependencies} from '@app/dependencies';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import {createTaskUseCases} from '@features/tasks/services/taskUseCases';
import type {TaskUseCases} from '@features/tasks/services/taskUseCases';
import type {AuthService} from '@features/auth/types';
import type {SyncQueueRepository} from '@features/sync/types';
import {
  createConnectivityService,
  type ConnectivityService,
} from '@services/network/connectivity';

export function requireAuthService(): AuthService {
  return getAppDependencies().authService;
}

export function requireTaskRepository(): TaskRepository {
  const repository = getAppDependencies().taskRepository;
  if (!repository) {
    throw new Error(
      'Local database is not ready. Initialize SQLite before accessing tasks.',
    );
  }

  return repository;
}

export function requireTaskUseCases(): TaskUseCases {
  return createTaskUseCases(requireTaskRepository());
}

export function requireSyncQueueRepository(): SyncQueueRepository {
  const repository = getAppDependencies().syncQueueRepository;
  if (!repository) {
    throw new Error(
      'Local database is not ready. Initialize SQLite before accessing the sync queue.',
    );
  }

  return repository;
}

let connectivityService: ConnectivityService | null = null;

export function getConnectivityService(): ConnectivityService {
  if (!connectivityService) {
    connectivityService = createConnectivityService();
  }

  return connectivityService;
}
