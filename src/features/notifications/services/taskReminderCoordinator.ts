import type {UniqueId} from '@app-types/common';

import type {
  LocalNotificationService,
  NotificationPermissionStatus,
  TaskReminder,
} from '@features/notifications/types';

export const TASK_REMINDERS_CHANNEL_ID = 'task-reminders';

/** Deterministic Notifee notification id — prevents duplicates per task. */
export function taskReminderNotificationId(taskId: UniqueId): string {
  return `task-reminder:${taskId}`;
}

/**
 * Schedules / cancels local task reminders based on task lifecycle events.
 * Keeps Notifee details out of Redux thunks and screens.
 */
export interface TaskReminderCoordinator {
  syncReminderForTask(task: {
    id: UniqueId;
    title: string;
    completed: boolean;
    deletedAt: string | null;
    reminderAt: string | null;
    dueAt: string | null;
  }): Promise<void>;
  cancelReminder(taskId: UniqueId): Promise<void>;
  rescheduleAll(
    tasks: ReadonlyArray<{
      id: UniqueId;
      title: string;
      completed: boolean;
      deletedAt: string | null;
      reminderAt: string | null;
      dueAt: string | null;
    }>,
  ): Promise<void>;
}

export function createTaskReminderCoordinator(
  localNotifications: LocalNotificationService,
): TaskReminderCoordinator {
  return {
    async syncReminderForTask(task) {
      try {
        if (task.completed || task.deletedAt || !task.reminderAt) {
          await localNotifications.cancelTaskReminder(task.id);
          return;
        }

        const remindAt = task.reminderAt;
        const when = new Date(remindAt);
        if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
          await localNotifications.cancelTaskReminder(task.id);
          return;
        }

        const reminder: TaskReminder = {
          taskId: task.id,
          title: 'Task reminder',
          body: task.title,
          remindAt,
        };

        await localNotifications.scheduleTaskReminder(reminder);
      } catch (error) {
        console.error('[notifications] Failed to sync task reminder.', error);
      }
    },

    async cancelReminder(taskId) {
      try {
        await localNotifications.cancelTaskReminder(taskId);
      } catch (error) {
        console.error('[notifications] Failed to cancel task reminder.', error);
      }
    },

    async rescheduleAll(tasks) {
      for (const task of tasks) {
        await this.syncReminderForTask(task);
      }
    },
  };
}

export type {NotificationPermissionStatus};
