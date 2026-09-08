import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KeyValueStorage {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * AsyncStorage adapter for non-secret preferences.
 * Prefer redux-persist for Redux-backed preferences; use this for ad-hoc keys.
 */
export function createKeyValueStorage(): KeyValueStorage {
  return {
    async getString(key) {
      return AsyncStorage.getItem(key);
    },
    async setString(key, value) {
      await AsyncStorage.setItem(key, value);
    },
    async remove(key) {
      await AsyncStorage.removeItem(key);
    },
  };
}
