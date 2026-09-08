import type {LocalNotificationService} from '@features/notifications/types';
import {notImplemented} from '@utils/notImplemented';

export function createLocalNotificationService(): LocalNotificationService {
  return {
    requestPermission: () =>
      notImplemented('LocalNotificationService.requestPermission'),
    scheduleTaskReminder: () =>
      notImplemented('LocalNotificationService.scheduleTaskReminder'),
    cancelTaskReminder: () =>
      notImplemented('LocalNotificationService.cancelTaskReminder'),
    cancelAll: () => notImplemented('LocalNotificationService.cancelAll'),
  };
}
