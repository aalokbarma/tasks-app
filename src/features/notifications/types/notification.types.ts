import type {ISODateString, UniqueId} from '@app-types/common';

export interface TaskReminder {
  taskId: UniqueId;
  title: string;
  body: string;
  remindAt: ISODateString;
}

export interface NotificationPermissionStatus {
  authorized: boolean;
  canRequest: boolean;
}

/**
 * Local notification scheduling contract (Notifee adapter).
 */
export interface LocalNotificationService {
  requestPermission(): Promise<NotificationPermissionStatus>;
  scheduleTaskReminder(reminder: TaskReminder): Promise<void>;
  cancelTaskReminder(taskId: UniqueId): Promise<void>;
  cancelAll(): Promise<void>;
}

/**
 * Push notification contract. Firebase Messaging adapter implements this.
 */
export interface PushNotificationService {
  requestPermission(): Promise<boolean>;
  getDeviceToken(): Promise<string | null>;
  registerTokenForUser(userId: UniqueId, token: string): Promise<void>;
  onTokenRefresh(listener: (token: string) => void): () => void;
}
