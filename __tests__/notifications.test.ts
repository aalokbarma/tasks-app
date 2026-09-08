import {
  createTaskReminderCoordinator,
  taskReminderNotificationId,
} from '@features/notifications/services/taskReminderCoordinator';
import type {LocalNotificationService} from '@features/notifications/types';

function createMockLocal(): LocalNotificationService & {
  scheduled: Array<{taskId: string; remindAt: string; body: string}>;
  cancelled: string[];
} {
  const scheduled: Array<{taskId: string; remindAt: string; body: string}> = [];
  const cancelled: string[] = [];

  return {
    scheduled,
    cancelled,
    requestPermission: jest.fn(async () => ({
      authorized: true,
      canRequest: false,
    })),
    scheduleTaskReminder: jest.fn(async reminder => {
      scheduled.push({
        taskId: reminder.taskId,
        remindAt: reminder.remindAt,
        body: reminder.body,
      });
    }),
    cancelTaskReminder: jest.fn(async taskId => {
      cancelled.push(taskId);
      const index = scheduled.findIndex(item => item.taskId === taskId);
      if (index >= 0) {
        scheduled.splice(index, 1);
      }
    }),
    cancelAll: jest.fn(async () => {
      scheduled.length = 0;
    }),
  };
}

describe('task reminder notifications', () => {
  it('uses a stable notification id per task', () => {
    expect(taskReminderNotificationId('abc')).toBe('task-reminder:abc');
  });

  it('schedules a future reminder', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const future = new Date(Date.now() + 120_000).toISOString();

    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'Dentist',
      completed: false,
      deletedAt: null,
      reminderAt: future,
      dueAt: future,
    });

    expect(local.scheduleTaskReminder).toHaveBeenCalledTimes(1);
    expect(local.scheduled[0]).toMatchObject({
      taskId: 't1',
      body: 'Dentist',
      remindAt: future,
    });
  });

  it('cancels when the task is completed or deleted', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const future = new Date(Date.now() + 120_000).toISOString();

    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'Done soon',
      completed: true,
      deletedAt: null,
      reminderAt: future,
      dueAt: future,
    });
    expect(local.cancelled).toContain('t1');

    await coordinator.cancelReminder('t2');
    expect(local.cancelled).toContain('t2');
  });

  it('cancels past or missing reminders instead of scheduling', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const past = new Date(Date.now() - 60_000).toISOString();

    await coordinator.syncReminderForTask({
      id: 'past',
      title: 'Too late',
      completed: false,
      deletedAt: null,
      reminderAt: past,
      dueAt: past,
    });
    expect(local.cancelled).toContain('past');
    expect(local.scheduled).toHaveLength(0);

    await coordinator.syncReminderForTask({
      id: 'none',
      title: 'No reminder',
      completed: false,
      deletedAt: null,
      reminderAt: null,
      dueAt: null,
    });
    expect(local.cancelled).toContain('none');
  });

  it('reschedules all active tasks and cancels inactive ones', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const future = new Date(Date.now() + 180_000).toISOString();

    await coordinator.rescheduleAll([
      {
        id: 'active',
        title: 'Keep',
        completed: false,
        deletedAt: null,
        reminderAt: future,
        dueAt: future,
      },
      {
        id: 'done',
        title: 'Skip',
        completed: true,
        deletedAt: null,
        reminderAt: future,
        dueAt: future,
      },
      {
        id: 'cleared',
        title: 'No time',
        completed: false,
        deletedAt: null,
        reminderAt: null,
        dueAt: future,
      },
    ]);

    expect(local.scheduled.map(item => item.taskId)).toEqual(['active']);
    expect(local.cancelled).toEqual(
      expect.arrayContaining(['done', 'cleared']),
    );
  });

  it('reschedules by replacing the previous reminder for the same task', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const first = new Date(Date.now() + 60_000).toISOString();
    const second = new Date(Date.now() + 120_000).toISOString();

    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'First',
      completed: false,
      deletedAt: null,
      reminderAt: first,
      dueAt: first,
    });
    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'Second',
      completed: false,
      deletedAt: null,
      reminderAt: second,
      dueAt: second,
    });

    expect(local.scheduleTaskReminder).toHaveBeenCalledTimes(2);
    expect(local.scheduled[local.scheduled.length - 1]).toMatchObject({
      taskId: 't1',
      body: 'Second',
      remindAt: second,
    });
  });
});
