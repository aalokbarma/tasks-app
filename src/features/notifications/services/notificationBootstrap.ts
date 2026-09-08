import type {UniqueId} from '@app-types/common';
import type {
  LocalNotificationService,
  PushNotificationService,
} from '@features/notifications/types';
import type {TaskReminderCoordinator} from '@features/notifications/services/taskReminderCoordinator';

/**
 * Registers the device FCM token for the signed-in user and keeps it fresh.
 * Returns an unsubscribe that stops token-refresh listening.
 *
 * Requires Firebase Console: Cloud Messaging enabled + APNs key (iOS).
 * Sending pushes requires a trusted server / Cloud Function — never ship
 * service-account credentials in the mobile app.
 */
export async function registerPushForUser(params: {
  push: PushNotificationService;
  userId: UniqueId;
}): Promise<() => void> {
  try {
    await params.push.requestPermission();
    const token = await params.push.getDeviceToken();
    if (token) {
      await params.push.registerTokenForUser(params.userId, token);
    }
  } catch (error) {
    console.error('[notifications] FCM token registration failed.', error);
  }

  try {
    return params.push.onTokenRefresh(nextToken => {
      params.push
        .registerTokenForUser(params.userId, nextToken)
        .catch(error => {
          console.error('[notifications] FCM token refresh failed.', error);
        });
    });
  } catch (error) {
    console.error('[notifications] FCM token refresh subscribe failed.', error);
    return () => undefined;
  }
}

export async function bootstrapLocalReminders(params: {
  local: LocalNotificationService;
  coordinator: TaskReminderCoordinator;
  loadTasks: () => Promise<
    ReadonlyArray<{
      id: UniqueId;
      title: string;
      completed: boolean;
      deletedAt: string | null;
      reminderAt: string | null;
      dueAt: string | null;
    }>
  >;
}): Promise<void> {
  try {
    await params.local.requestPermission();
  } catch (error) {
    console.error('[notifications] Local permission bootstrap failed.', error);
  }

  try {
    const tasks = await params.loadTasks();
    await params.coordinator.rescheduleAll(tasks);
  } catch (error) {
    console.error('[notifications] Reminder reschedule failed.', error);
  }
}
