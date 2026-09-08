import {
  doc,
  FieldValue,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

import type {UniqueId} from '@app-types/common';
import type {PushNotificationService} from '@features/notifications/types';

import {getFirebaseAppHandle} from './app';
import {
  AppFirebaseError,
  ensureFirebaseReady,
  mapMessagingError,
} from './errors';

export type FirebaseMessagingService = PushNotificationService;

async function requestIosPermissionIfNeeded(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return true;
  }

  const authStatus = await requestPermission(getMessaging());
  return (
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL
  );
}

export function createFirebaseMessagingService(): FirebaseMessagingService {
  return {
    async requestPermission(): Promise<boolean> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        return await requestIosPermissionIfNeeded();
      } catch (error) {
        throw mapMessagingError(error);
      }
    },

    async getDeviceToken(): Promise<string | null> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);

        const permitted = await requestIosPermissionIfNeeded();
        if (!permitted) {
          return null;
        }

        return await getToken(getMessaging());
      } catch (error) {
        throw mapMessagingError(error);
      }
    },

    async registerTokenForUser(
      userId: UniqueId,
      token: string,
    ): Promise<void> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);

        if (!token.trim()) {
          throw new AppFirebaseError(
            'messaging/unknown',
            'Cannot register an empty FCM token.',
          );
        }

        await setDoc(
          doc(getFirestore(), 'users', userId),
          {
            fcmTokens: FieldValue.arrayUnion(token),
            updatedAt: new Date().toISOString(),
          },
          {merge: true},
        );
      } catch (error) {
        throw mapMessagingError(error);
      }
    },

    onTokenRefresh(listener: (token: string) => void): () => void {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
      } catch (error) {
        console.error('[firebase/messaging] Token refresh unavailable.', error);
        return () => undefined;
      }

      return onTokenRefresh(getMessaging(), listener);
    },
  };
}
