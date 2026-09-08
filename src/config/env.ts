import Config from 'react-native-config';

import type {AppEnvironment} from '@app-types/common';

import {APP_ENVIRONMENTS} from './constants';

export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppConfig {
  appEnv: AppEnvironment;
  appName: string;
  firebase: FirebasePublicConfig | null;
}

function isAppEnvironment(value: string): value is AppEnvironment {
  return (APP_ENVIRONMENTS as readonly string[]).includes(value);
}

function readOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function readFirebasePublicConfig(): FirebasePublicConfig | null {
  const apiKey = readOptional(Config.FIREBASE_API_KEY);
  const authDomain = readOptional(Config.FIREBASE_AUTH_DOMAIN);
  const projectId = readOptional(Config.FIREBASE_PROJECT_ID);
  const storageBucket = readOptional(Config.FIREBASE_STORAGE_BUCKET);
  const messagingSenderId = readOptional(Config.FIREBASE_MESSAGING_SENDER_ID);
  const appId = readOptional(Config.FIREBASE_APP_ID);

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function resolveAppEnvironment(
  value: string | undefined,
): AppEnvironment {
  if (value && isAppEnvironment(value)) {
    return value;
  }

  return 'development';
}

export function getAppConfig(): AppConfig {
  return {
    appEnv: resolveAppEnvironment(Config.APP_ENV),
    appName: readOptional(Config.APP_NAME) ?? 'TasksApp',
    firebase: readFirebasePublicConfig(),
  };
}
