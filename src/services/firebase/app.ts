import {getApp, getApps} from '@react-native-firebase/app';

import {getAppConfig, isFirebaseEnvConfigured} from '@config/env';
import {reportError, reportWarning} from '@utils/errors';

export interface FirebaseAppHandle {
  readonly name: string;
  readonly projectId: string | null;
  readonly ready: boolean;
}

let cachedHandle: FirebaseAppHandle | null = null;

function createUnconfiguredHandle(name: string): FirebaseAppHandle {
  return {
    name,
    projectId: null,
    ready: false,
  };
}

/**
 * Initializes (or reuses) the default native Firebase app.
 *
 * React Native Firebase loads credentials from native config files
 * (`google-services.json` / `GoogleService-Info.plist`), never from source.
 * JS env vars are used to validate the expected project for the active environment.
 */
export function initializeFirebaseApp(): FirebaseAppHandle {
  if (cachedHandle) {
    return cachedHandle;
  }

  if (!isFirebaseEnvConfigured()) {
    cachedHandle = createUnconfiguredHandle('[unconfigured]');
    return cachedHandle;
  }

  try {
    if (getApps().length === 0) {
      cachedHandle = createUnconfiguredHandle('[native-config-missing]');
      return cachedHandle;
    }

    const app = getApp();
    const config = getAppConfig();
    const projectId = app.options.projectId ?? null;
    const expectedProjectId = config.firebase?.projectId ?? null;

    if (
      expectedProjectId &&
      projectId &&
      expectedProjectId !== projectId
    ) {
      reportWarning(
        'firebase',
        `Native projectId "${projectId}" does not match env FIREBASE_PROJECT_ID "${expectedProjectId}".`,
      );
    }

    cachedHandle = {
      name: app.name,
      projectId,
      ready: true,
    };

    return cachedHandle;
  } catch (error) {
    reportError('firebase', error);
    cachedHandle = createUnconfiguredHandle('[unavailable]');
    return cachedHandle;
  }
}

export function getFirebaseAppHandle(): FirebaseAppHandle {
  return initializeFirebaseApp();
}

export function isFirebaseConfigured(): boolean {
  return initializeFirebaseApp().ready;
}

/** Test-only helper to clear the singleton between cases. */
export function __resetFirebaseAppForTests(): void {
  cachedHandle = null;
}
