import {notImplemented} from '@utils/notImplemented';

export interface KeyValueStorage {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * AsyncStorage adapter for non-secret preferences (theme, last email, etc.).
 */
export function createKeyValueStorage(): KeyValueStorage {
  return {
    getString: () => notImplemented('KeyValueStorage.getString'),
    setString: () => notImplemented('KeyValueStorage.setString'),
    remove: () => notImplemented('KeyValueStorage.remove'),
  };
}
