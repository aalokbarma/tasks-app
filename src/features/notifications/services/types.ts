import type {LocalNotificationService, PushNotificationService} from '../types';

export interface NotificationServices {
  local: LocalNotificationService;
  push: PushNotificationService;
}
