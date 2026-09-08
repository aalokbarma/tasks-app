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

export interface SyncState {
  connectivity: ConnectivityStatus;
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
