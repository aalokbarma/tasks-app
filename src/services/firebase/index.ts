export type {FirebaseAppHandle} from './app';
export {
  __resetFirebaseAppForTests,
  getFirebaseAppHandle,
  initializeFirebaseApp,
  isFirebaseConfigured,
} from './app';
export {createFirebaseAuthService} from './auth';
export type {FirebaseErrorCode} from './errors';
export {
  AppFirebaseError,
  ensureFirebaseReady,
  mapAuthError,
  mapFirestoreError,
  mapMessagingError,
} from './errors';
export type {FirestoreService} from './firestore';
export {
  createFirestoreService,
  createFirestoreTaskRemoteDataSource,
} from './firestore';
export type {FirebaseMessagingService} from './messaging';
export {createFirebaseMessagingService} from './messaging';
export {
  userDocumentPath,
  userTaskDocumentPath,
  userTasksCollectionPath,
} from './paths';
