import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import {Platform} from 'react-native';

import type {
  LocalNotificationService,
  NotificationPermissionStatus,
  TaskReminder,
} from '@features/notifications/types';

import {
  TASK_REMINDERS_CHANNEL_ID,
  taskReminderNotificationId,
} from '@features/notifications/services/taskReminderCoordinator';
import {reportError} from '@utils/errors';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: TASK_REMINDERS_CHANNEL_ID,
    name: 'Task reminders',
    description: 'Reminders for upcoming tasks',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
}

function mapAuthorizationStatus(
  status: AuthorizationStatus,
): NotificationPermissionStatus {
  const authorized =
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL;

  const canRequest =
    status === AuthorizationStatus.NOT_DETERMINED ||
    status === AuthorizationStatus.DENIED;

  return {authorized, canRequest};
}

/**
 * Notifee-backed local reminders.
 * Never throws to callers for permission denial / scheduling failures —
 * the coordinator logs and the app continues offline-first.
 */
export function createLocalNotificationService(): LocalNotificationService {
  let channelReady = false;

  async function prepareChannel(): Promise<void> {
    if (channelReady) {
      return;
    }

    try {
      await ensureAndroidChannel();
      channelReady = true;
    } catch (error) {
      reportError('notifications/channel', error);
    }
  }

  return {
    async requestPermission() {
      try {
        await prepareChannel();
        const settings = await notifee.requestPermission();
        return mapAuthorizationStatus(settings.authorizationStatus);
      } catch (error) {
        reportError('notifications/permission', error);
        return {authorized: false, canRequest: false};
      }
    },

    async scheduleTaskReminder(reminder: TaskReminder) {
      try {
        await prepareChannel();

        const settings = await notifee.getNotificationSettings();
        const status = mapAuthorizationStatus(settings.authorizationStatus);
        if (!status.authorized) {
          // Graceful no-op when permission is denied.
          return;
        }

        const timestamp = new Date(reminder.remindAt).getTime();
        if (Number.isNaN(timestamp) || timestamp <= Date.now()) {
          await notifee.cancelNotification(
            taskReminderNotificationId(reminder.taskId),
          );
          return;
        }

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp,
          // AlarmManager on Android for better delivery when idle.
          alarmManager: {
            allowWhileIdle: true,
          },
        };

        // createTriggerNotification with a stable id upserts — no duplicates.
        await notifee.createTriggerNotification(
          {
            id: taskReminderNotificationId(reminder.taskId),
            title: reminder.title,
            body: reminder.body,
            data: {
              taskId: reminder.taskId,
              type: 'task-reminder',
            },
            android: {
              channelId: TASK_REMINDERS_CHANNEL_ID,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
            },
          },
          trigger,
        );
      } catch (error) {
        reportError('notifications/schedule', error, {
          taskId: reminder.taskId,
        });
      }
    },

    async cancelTaskReminder(taskId) {
      try {
        await notifee.cancelNotification(taskReminderNotificationId(taskId));
      } catch (error) {
        reportError('notifications/cancel', error, {taskId});
      }
    },

    async cancelAll() {
      try {
        await notifee.cancelAllNotifications();
      } catch (error) {
        reportError('notifications/cancel-all', error);
      }
    },
  };
}
