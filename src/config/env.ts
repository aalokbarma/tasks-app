import Config from 'react-native-config';

import type {AppEnvironment} from '@app-types/common';

import {APP_ENVIRONMENTS} from './constants';

/**
 * Raw environment keys exposed by react-native-config.
 * Firebase values come exclusively from these variables.
 */
export interface EnvVariables {
  APP_ENV: AppEnvironment;
  APP_NAME: string;
  FIREBASE_API_KEY: string | null;
  FIREBASE_AUTH_DOMAIN: string | null;
  FIREBASE_PROJECT_ID: string | null;
  FIREBASE_STORAGE_BUCKET: string | null;
  FIREBASE_MESSAGING_SENDER_ID: string | null;
  FIREBASE_APP_ID: string | null;
}

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
  /**
   * Flat key access mirroring .env variable names.
   */
  env: EnvVariables;
}

function isAppEnvironment(value: string): value is AppEnvironment {
  return (APP_ENVIRONMENTS as readonly string[]).includes(value);
}

function readOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function resolveAppEnvironment(
  value: string | undefined,
): AppEnvironment {
  if (value && isAppEnvironment(value)) {
    return value;
  }

  return 'development';
}

export function readEnvVariables(): EnvVariables {
  return {
    APP_ENV: resolveAppEnvironment(Config.APP_ENV),
    APP_NAME: readOptional(Config.APP_NAME) ?? 'Tasks App',
    FIREBASE_API_KEY: readOptional(Config.FIREBASE_API_KEY),
    FIREBASE_AUTH_DOMAIN: readOptional(Config.FIREBASE_AUTH_DOMAIN),
    FIREBASE_PROJECT_ID: readOptional(Config.FIREBASE_PROJECT_ID),
    FIREBASE_STORAGE_BUCKET: readOptional(Config.FIREBASE_STORAGE_BUCKET),
    FIREBASE_MESSAGING_SENDER_ID: readOptional(
      Config.FIREBASE_MESSAGING_SENDER_ID,
    ),
    FIREBASE_APP_ID: readOptional(Config.FIREBASE_APP_ID),
  };
}

export function toFirebasePublicConfig(
  env: EnvVariables,
): FirebasePublicConfig | null {
  const {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
  } = env;

  if (
    !FIREBASE_API_KEY ||
    !FIREBASE_AUTH_DOMAIN ||
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_STORAGE_BUCKET ||
    !FIREBASE_MESSAGING_SENDER_ID ||
    !FIREBASE_APP_ID
  ) {
    return null;
  }

  return {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
  };
}

/**
 * Typed configuration entry point for the app.
 * All Firebase settings are sourced from environment variables only.
 */
export function getAppConfig(): AppConfig {
  const env = readEnvVariables();

  return {
    appEnv: env.APP_ENV,
    appName: env.APP_NAME,
    firebase: toFirebasePublicConfig(env),
    env,
  };
}

export function getEnv(): EnvVariables {
  return readEnvVariables();
}

export function getFirebaseEnv(): Pick<
  EnvVariables,
  | 'FIREBASE_API_KEY'
  | 'FIREBASE_AUTH_DOMAIN'
  | 'FIREBASE_PROJECT_ID'
  | 'FIREBASE_STORAGE_BUCKET'
  | 'FIREBASE_MESSAGING_SENDER_ID'
  | 'FIREBASE_APP_ID'
> {
  const env = readEnvVariables();

  return {
    FIREBASE_API_KEY: env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: env.FIREBASE_APP_ID,
  };
}

/**
 * Returns a complete Firebase public config or throws.
 * Use when a feature requires Firebase to be configured.
 */
export function requireFirebasePublicConfig(): FirebasePublicConfig {
  const firebase = toFirebasePublicConfig(readEnvVariables());

  if (!firebase) {
    throw new Error(
      'Firebase environment variables are incomplete. Set FIREBASE_API_KEY, ' +
        'FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, ' +
        'FIREBASE_MESSAGING_SENDER_ID, and FIREBASE_APP_ID in the active .env file.',
    );
  }

  return firebase;
}

export function isFirebaseEnvConfigured(): boolean {
  return toFirebasePublicConfig(readEnvVariables()) !== null;
}
