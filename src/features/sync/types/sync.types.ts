import type {
  ConnectivityStatus,
  ISODateString,
  SyncOperation,
  UniqueId,
} from '@app-types/common';

export interface SyncQueueItem {
  id: UniqueId;
  entityType: 'task';
  entityId: UniqueId;
  operation: SyncOperation;
  payloadJson: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: ISODateString;
}

/**
 * Sync UI/application state only.
 * Connectivity lives in the network slice.
 */
export interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: ISODateString | null;
  lastError: string | null;
}

export interface SyncEngine {
  start(): Promise<void>;
  stop(): Promise<void>;
  flush(): Promise<void>;
}

// Re-export for convenience when sync UI needs network context typing.
export type {ConnectivityStatus};
