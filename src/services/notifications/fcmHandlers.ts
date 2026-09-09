import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';

import {TASK_REMINDERS_CHANNEL_ID} from '@features/notifications/services/taskReminderCoordinator';
import {reportError} from '@utils/errors';

/**
 * HIGH-importance channel so Android shows a heads-up banner while the app
 * is open. New id — Android does not upgrade importance on an existing channel.
 */
const FCM_CHANNEL_ID = 'fcm-alerts';

async function ensureFcmChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: FCM_CHANNEL_ID,
    name: 'Alerts',
    description: 'Push messages and updates',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
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
 * Displays a foreground (and background data) FCM payload via Notifee so a
 * banner/heads-up appears while the app is open — the system does not show
 * FCM `notification` payloads automatically in the foreground.
 */
export async function displayRemoteMessage(
  remoteMessage: RemoteMessage,
): Promise<void> {
  try {
    await ensureFcmChannel();

    const title =
      remoteMessage.notification?.title ??
      readDataString(remoteMessage.data, 'title') ??
      'Tasks App';
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
      body: body || undefined,
      data: toNotifeeData(remoteMessage.data),
      android: {
        channelId: FCM_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
        sound: 'default',
        onlyAlertOnce: false,
      },
      ios: {
        sound: 'default',
        // Required for banners while the app is in the foreground.
        foregroundPresentationOptions: {
          banner: true,
          list: true,
          sound: true,
          badge: true,
        },
      },
    });
  } catch (error) {
    reportError('notifications/fcm-display', error);
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
    reportError('notifications/fcm-background', error);
  }
}

export function subscribeForegroundMessages(): () => void {
  try {
    return onMessage(getMessaging(), async remoteMessage => {
      await displayRemoteMessage(remoteMessage);
    });
  } catch (error) {
    reportError('notifications/fcm-foreground', error);
    return () => undefined;
  }
}

// Re-export channel constant for docs/tests.
export {TASK_REMINDERS_CHANNEL_ID};
