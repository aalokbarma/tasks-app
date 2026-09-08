import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';

import {TASK_REMINDERS_CHANNEL_ID} from '@features/notifications/services/taskReminderCoordinator';

const FCM_CHANNEL_ID = 'fcm-messages';

async function ensureFcmChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: FCM_CHANNEL_ID,
    name: 'Messages',
    importance: AndroidImportance.DEFAULT,
  });
}

function readDataString(
  data: RemoteMessage['data'] | undefined,
  key: string,
): string | undefined {
  const value = data?.[key];
  return typeof value === 'string' ? value : undefined;
}

function toNotifeeData(
  data: RemoteMessage['data'] | undefined,
): Record<string, string> | undefined {
  if (!data) {
    return undefined;
  }

  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      next[key] = value;
    }
  }
  return next;
}

/**
 * Displays a foreground FCM data/notification payload via Notifee.
 * Remote push delivery still requires Firebase Console / server setup.
 */
export async function displayRemoteMessage(
  remoteMessage: RemoteMessage,
): Promise<void> {
  try {
    await ensureFcmChannel();

    const title =
      remoteMessage.notification?.title ??
      readDataString(remoteMessage.data, 'title') ??
      'TasksApp';
    const body =
      remoteMessage.notification?.body ??
      readDataString(remoteMessage.data, 'body') ??
      '';

    if (!body && !remoteMessage.notification?.title) {
      return;
    }

    await notifee.displayNotification({
      id: remoteMessage.messageId ?? undefined,
      title,
      body,
      data: toNotifeeData(remoteMessage.data),
      android: {
        channelId: FCM_CHANNEL_ID,
        pressAction: {id: 'default'},
      },
    });
  } catch (error) {
    console.error('[notifications] Failed to display remote message.', error);
  }
}

/**
 * Must be registered as early as possible (index.js) for Android background.
 */
export function registerBackgroundMessageHandler(): void {
  try {
    setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
      await displayRemoteMessage(remoteMessage);
    });
  } catch (error) {
    console.error(
      '[notifications] Background message handler unavailable.',
      error,
    );
  }
}

export function subscribeForegroundMessages(): () => void {
  try {
    return onMessage(getMessaging(), async remoteMessage => {
      await displayRemoteMessage(remoteMessage);
    });
  } catch (error) {
    console.error(
      '[notifications] Foreground message handler unavailable.',
      error,
    );
    return () => undefined;
  }
}

// Re-export channel constant for docs/tests.
export {TASK_REMINDERS_CHANNEL_ID};
