import {getAppDependencies} from '@app/dependencies';
import type {AuthRepository} from '@features/auth/repositories/AuthRepository';
import type {AuthService} from '@features/auth/types';
import type {TaskReminderCoordinator} from '@features/notifications/services/taskReminderCoordinator';
import type {
  LocalNotificationService,
  PushNotificationService,
} from '@features/notifications/types';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import {createTaskUseCases} from '@features/tasks/services/taskUseCases';
import type {TaskUseCases} from '@features/tasks/services/taskUseCases';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import type {SyncManager} from '@features/sync/services/syncManager';
import type {SyncQueueRepository} from '@features/sync/types';
import {
  createConnectivityService,
  type ConnectivityService,
} from '@services/network/connectivity';

export function requireAuthService(): AuthService {
  return getAppDependencies().authService;
}

export function requireAuthRepository(): AuthRepository {
  return getAppDependencies().authRepository;
}

export function requireTaskRepository(): TaskRepository {
  const repository = getAppDependencies().taskRepository;
  if (!repository) {
    throw new Error(
      'Local database is not ready. Initialize SQLite before accessing tasks.',
    );
  }

  // Repository identity can change after DB init — drop cached use cases.
  if (cachedTaskUseCasesRepo !== repository) {
    cachedTaskUseCases = null;
    cachedTaskUseCasesRepo = repository;
  }

  return repository;
}

let cachedTaskUseCases: TaskUseCases | null = null;
let cachedTaskUseCasesRepo: TaskRepository | null = null;

export function requireTaskUseCases(): TaskUseCases {
  if (!cachedTaskUseCases) {
    cachedTaskUseCases = createTaskUseCases(requireTaskRepository());
  }

  return cachedTaskUseCases;
}

export function requireTaskRemoteDataSource(): TaskRemoteDataSource {
  return getAppDependencies().taskRemoteDataSource;
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

export function requireLocalNotificationService(): LocalNotificationService {
  return getAppDependencies().localNotificationService;
}

export function requirePushNotificationService(): PushNotificationService {
  return getAppDependencies().pushNotificationService;
}

export function requireTaskReminderCoordinator(): TaskReminderCoordinator {
  return getAppDependencies().taskReminderCoordinator;
}

let connectivityService: ConnectivityService | null = null;

export function getConnectivityService(): ConnectivityService {
  if (!connectivityService) {
    connectivityService = createConnectivityService();
  }

  return connectivityService;
}

let syncManager: SyncManager | null = null;

export function registerSyncManager(manager: SyncManager): void {
  syncManager = manager;
}

export function clearSyncManager(): void {
  syncManager = null;
}

export function requireSyncManager(): SyncManager {
  if (!syncManager) {
    throw new Error(
      'Sync manager is not started. Call bootstrapAppState before synchronizing.',
    );
  }

  return syncManager;
}

export function resetSyncRuntimeForTests(): void {
  syncManager = null;
  connectivityService = null;
  cachedTaskUseCases = null;
  cachedTaskUseCasesRepo = null;
}
