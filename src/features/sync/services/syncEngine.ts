import type {SyncEngine} from '../types';

import {
  createSyncManager,
  type SyncManagerDependencies,
  type SyncManager,
} from './syncManager';

/**
 * Factory kept for the SyncEngine port. Prefer createSyncManager when hooks
 * or custom dependencies are needed (tests, composition root).
 */
export function createSyncEngine(
  deps: SyncManagerDependencies,
): SyncEngine & SyncManager {
  return createSyncManager(deps);
}

export {createSyncManager, SyncManager, SYNC_MAX_ATTEMPTS} from './syncManager';
export type {
  SyncCycleResult,
  SyncManagerDependencies,
  SyncManagerHooks,
} from './syncManager';
