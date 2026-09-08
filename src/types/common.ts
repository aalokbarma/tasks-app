export type AppEnvironment = 'development' | 'staging' | 'production';

export type ThemeMode = 'light' | 'dark' | 'system';

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export type SyncOperation = 'create' | 'update' | 'delete';

export type AuthStatus =
  | 'unknown'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export type ConnectivityStatus = 'online' | 'offline' | 'unknown';

export type ISODateString = string;

export type UniqueId = string;
