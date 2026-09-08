import {
  arrayUnion,
  doc,
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
import notifee, {
  AuthorizationStatus as NotifeeAuthorizationStatus,
} from '@notifee/react-native';
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

async function requestNotificationPermission(): Promise<boolean> {
  // Android 13+ POST_NOTIFICATIONS via Notifee; iOS via Messaging + Notifee.
  try {
    const settings = await notifee.requestPermission();
    const notifeeOk =
      settings.authorizationStatus === NotifeeAuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === NotifeeAuthorizationStatus.PROVISIONAL;

    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(getMessaging());
      const messagingOk =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      return notifeeOk && messagingOk;
    }

    return notifeeOk;
  } catch {
    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(getMessaging());
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      );
    }

    // Android: treat as permitted when Notifee is unavailable (pre-13).
    return true;
  }
}

export function createFirebaseMessagingService(): FirebaseMessagingService {
  return {
    async requestPermission(): Promise<boolean> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        return await requestNotificationPermission();
      } catch (error) {
        throw mapMessagingError(error);
      }
    },

    async getDeviceToken(): Promise<string | null> {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        // Caller is expected to request permission first (see registerPushForUser).
        return await getToken(getMessaging());
      } catch (error) {
        // Graceful: push is bonus; app works without a token.
        console.error('[firebase/messaging] getDeviceToken failed.', error);
        return null;
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

        // Path is users/{userId}. Security rules require auth.uid == userId.
        await setDoc(
          doc(getFirestore(), 'users', userId),
          {
            fcmTokens: arrayUnion(token),
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
