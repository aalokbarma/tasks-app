import {getAppConfig} from '@config/env';
import {notImplemented} from '@utils/notImplemented';

export interface FirebaseAppHandle {
  readonly name: string;
  readonly projectId: string | null;
}

/**
 * Firebase app bootstrap boundary.
 * Native RN Firebase packages are wired in a later implementation phase.
 */
export function initializeFirebaseApp(): FirebaseAppHandle {
  const config = getAppConfig();

  if (!config.firebase) {
    return {
      name: '[unconfigured]',
      projectId: null,
    };
  }

  return notImplemented('initializeFirebaseApp');
}

export function isFirebaseConfigured(): boolean {
  return getAppConfig().firebase !== null;
}
