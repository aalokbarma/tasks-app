import {
  getAppConfig,
  getEnv,
  getFirebaseEnv,
  isFirebaseEnvConfigured,
  requireFirebasePublicConfig,
  resolveAppEnvironment,
  toFirebasePublicConfig,
} from '@config/env';

jest.mock('react-native-config', () => ({
  APP_ENV: 'staging',
  APP_NAME: 'TasksApp Staging',
  FIREBASE_API_KEY: 'test-api-key',
  FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'example-project',
  FIREBASE_STORAGE_BUCKET: 'example-project.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: '1234567890',
  FIREBASE_APP_ID: '1:1234567890:web:abcdef',
}));

describe('env config', () => {
  it('resolves known app environments', () => {
    expect(resolveAppEnvironment('development')).toBe('development');
    expect(resolveAppEnvironment('staging')).toBe('staging');
    expect(resolveAppEnvironment('production')).toBe('production');
    expect(resolveAppEnvironment('nope')).toBe('development');
  });

  it('exposes FIREBASE_* keys from environment variables', () => {
    const env = getEnv();

    expect(env.APP_ENV).toBe('staging');
    expect(env.FIREBASE_API_KEY).toBe('test-api-key');
    expect(env.FIREBASE_AUTH_DOMAIN).toBe('example.firebaseapp.com');
    expect(env.FIREBASE_PROJECT_ID).toBe('example-project');
    expect(env.FIREBASE_STORAGE_BUCKET).toBe(
      'example-project.appspot.com',
    );
    expect(env.FIREBASE_MESSAGING_SENDER_ID).toBe('1234567890');
    expect(env.FIREBASE_APP_ID).toBe('1:1234567890:web:abcdef');
  });

  it('builds structured firebase config from env variables', () => {
    const config = getAppConfig();

    expect(isFirebaseEnvConfigured()).toBe(true);
    expect(config.firebase).toEqual({
      apiKey: 'test-api-key',
      authDomain: 'example.firebaseapp.com',
      projectId: 'example-project',
      storageBucket: 'example-project.appspot.com',
      messagingSenderId: '1234567890',
      appId: '1:1234567890:web:abcdef',
    });
    expect(requireFirebasePublicConfig().projectId).toBe('example-project');
    expect(getFirebaseEnv().FIREBASE_PROJECT_ID).toBe('example-project');
  });

  it('returns null firebase config when any key is missing', () => {
    expect(
      toFirebasePublicConfig({
        APP_ENV: 'development',
        APP_NAME: 'TasksApp',
        FIREBASE_API_KEY: 'present',
        FIREBASE_AUTH_DOMAIN: null,
        FIREBASE_PROJECT_ID: 'project',
        FIREBASE_STORAGE_BUCKET: 'bucket',
        FIREBASE_MESSAGING_SENDER_ID: 'sender',
        FIREBASE_APP_ID: 'app',
      }),
    ).toBeNull();
  });
});
