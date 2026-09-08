import type {PushNotificationService} from '@features/notifications/types';
import {notImplemented} from '@utils/notImplemented';

export function createFirebaseMessagingService(): PushNotificationService {
  return {
    getDeviceToken: () =>
      notImplemented('FirebaseMessagingService.getDeviceToken'),
    registerTokenForUser: () =>
      notImplemented('FirebaseMessagingService.registerTokenForUser'),
  };
}
