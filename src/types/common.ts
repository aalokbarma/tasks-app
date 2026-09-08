export type AppEnvironment = 'development' | 'staging' | 'production';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Local change tracking for offline-first sync.
 * - synced: matches remote
 * - created: local create not yet pushed
 * - updated: local update not yet pushed
 * - deleted: local soft-delete not yet pushed
 * - pending: queued/generic pending state
 */
export type SyncStatus =
  | 'synced'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'pending';

export type SyncOperation = 'create' | 'update' | 'delete';

export type AuthStatus =
  | 'unknown'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export type ConnectivityStatus = 'online' | 'offline' | 'unknown';

export type ISODateString = string;

export type UniqueId = string;
