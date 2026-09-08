import type {AuthService} from '@features/auth/types';
import type {AuthRepository} from '@features/auth/repositories/AuthRepository';
import {createAuthRepository} from '@features/auth/services/createAuthRepository';
import type {
  LocalNotificationService,
  PushNotificationService,
} from '@features/notifications/types';
import {
  createTaskReminderCoordinator,
  type TaskReminderCoordinator,
} from '@features/notifications/services/taskReminderCoordinator';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import type {SyncQueueRepository} from '@features/sync/types';
import {createLocalNotificationService} from '@services/notifications/localNotifications';

import {
  createSqliteSyncQueueRepository,
  createSqliteTaskRepository,
  initializeDatabase,
  type DatabaseClient,
} from '@database/index';
import {
  createFirebaseAuthService,
  createFirebaseMessagingService,
  createFirestoreService,
  createFirestoreTaskRemoteDataSource,
  initializeFirebaseApp,
  type FirebaseAppHandle,
  type FirestoreService,
} from '@services/firebase';

/**
 * Dependency composition root for infrastructure adapters.
 * Feature modules should consume these interfaces — never Firebase/SQLite SDKs directly.
 */
export interface AppDependencies {
  readonly ready: boolean;
  readonly firebaseApp: FirebaseAppHandle;
  /** Raw Firebase auth adapter. Prefer authRepository in app code. */
  readonly authService: AuthService;
  /** Validating feature-facing auth port used by thunks/UI. */
  readonly authRepository: AuthRepository;
  readonly firestoreService: FirestoreService;
  readonly taskRemoteDataSource: TaskRemoteDataSource;
  readonly pushNotificationService: PushNotificationService;
  readonly localNotificationService: LocalNotificationService;
  readonly taskReminderCoordinator: TaskReminderCoordinator;
  readonly database: DatabaseClient | null;
  readonly taskRepository: TaskRepository | null;
  readonly syncQueueRepository: SyncQueueRepository | null;
}

let dependencies: AppDependencies | null = null;

function createBaseDependencies(
  database: DatabaseClient | null,
): AppDependencies {
  const firebaseApp = initializeFirebaseApp();
  const firestoreService = createFirestoreService();
  const authService = createFirebaseAuthService();
  const localNotificationService = createLocalNotificationService();

  return {
    ready: firebaseApp.ready && database !== null,
    firebaseApp,
    authService,
    authRepository: createAuthRepository(authService),
    firestoreService,
    taskRemoteDataSource: createFirestoreTaskRemoteDataSource(firestoreService),
    pushNotificationService: createFirebaseMessagingService(),
    localNotificationService,
    taskReminderCoordinator: createTaskReminderCoordinator(
      localNotificationService,
    ),
    database,
    taskRepository: database ? createSqliteTaskRepository(database) : null,
    syncQueueRepository: database
      ? createSqliteSyncQueueRepository(database)
      : null,
  };
}

export function createAppDependencies(): AppDependencies {
  return createBaseDependencies(null);
}

export function getAppDependencies(): AppDependencies {
  if (!dependencies) {
    dependencies = createAppDependencies();
  }

  return dependencies;
}

/**
 * Opens SQLite, runs migrations, and registers local repositories.
 * Safe to call repeatedly.
 */
export async function initializeLocalPersistence(): Promise<AppDependencies> {
  const database = await initializeDatabase();
  dependencies = createBaseDependencies(database);
  return dependencies;
}

export function resetAppDependenciesForTests(): void {
  dependencies = null;
}
