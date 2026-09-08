import type {AuthService} from '@features/auth/types';
import type {PushNotificationService} from '@features/notifications/types';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';

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
 * Feature modules should consume these interfaces — never Firebase SDKs directly.
 */
export interface AppDependencies {
  readonly ready: boolean;
  readonly firebaseApp: FirebaseAppHandle;
  readonly authService: AuthService;
  readonly firestoreService: FirestoreService;
  readonly taskRemoteDataSource: TaskRemoteDataSource;
  readonly pushNotificationService: PushNotificationService;
}

let dependencies: AppDependencies | null = null;

export function createAppDependencies(): AppDependencies {
  const firebaseApp = initializeFirebaseApp();
  const firestoreService = createFirestoreService();

  return {
    ready: firebaseApp.ready,
    firebaseApp,
    authService: createFirebaseAuthService(),
    firestoreService,
    taskRemoteDataSource: createFirestoreTaskRemoteDataSource(firestoreService),
    pushNotificationService: createFirebaseMessagingService(),
  };
}

export function getAppDependencies(): AppDependencies {
  if (!dependencies) {
    dependencies = createAppDependencies();
  }

  return dependencies;
}

export function resetAppDependenciesForTests(): void {
  dependencies = null;
}
