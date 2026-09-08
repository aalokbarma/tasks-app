import type {SyncEngine} from '../types';
import {notImplemented} from '@utils/notImplemented';

export function createSyncEngine(): SyncEngine {
  return {
    start: () => notImplemented('SyncEngine.start'),
    stop: () => notImplemented('SyncEngine.stop'),
    flush: () => notImplemented('SyncEngine.flush'),
  };
}
