/**
 * @format
 */

import {
  emptyTaskFormValues,
  taskToFormValues,
  toUpdateTaskInput,
  validateTaskForm,
} from '../src/features/tasks/utils/validateTaskForm';
import {
  createTaskReminderCoordinator,
  taskReminderNotificationId,
} from '../src/features/notifications/services/taskReminderCoordinator';
import type {LocalNotificationService} from '../src/features/notifications/types';

describe('task form validation', () => {
  it('requires a title', () => {
    const result = validateTaskForm({
      ...emptyTaskFormValues(),
      title: '   ',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.title).toBeTruthy();
    }
  });

  it('accepts a valid create payload with reminder', () => {
    const result = validateTaskForm({
      title: 'Buy milk',
      description: '2%',
      dueDate: '2026-09-10',
      remindOnDueDate: true,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.createInput.title).toBe('Buy milk');
      expect(result.createInput.description).toBe('2%');
      expect(result.createInput.dueAt).toContain('2026-09-10');
      expect(result.createInput.reminderAt).toBe(result.createInput.dueAt);
    }
  });

  it('omits reminder when toggle is off', () => {
    const result = validateTaskForm({
      title: 'Buy milk',
      description: '',
      dueDate: '2026-09-10',
      remindOnDueDate: false,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.createInput.reminderAt).toBeNull();
    }
  });

  it('maps task values for edit', () => {
    const values = taskToFormValues({
      title: 'Ship it',
      description: null,
      dueAt: '2026-09-10T12:00:00.000Z',
      reminderAt: '2026-09-10T12:00:00.000Z',
    });
    expect(values).toEqual({
      title: 'Ship it',
      description: '',
      dueDate: '2026-09-10',
      remindOnDueDate: true,
    });

    const update = toUpdateTaskInput('task-1', values);
    expect(update.valid).toBe(true);
    if (update.valid) {
      expect(update.input.id).toBe('task-1');
      expect(update.input.title).toBe('Ship it');
      expect(update.input.reminderAt).toBeTruthy();
    }
  });
});

describe('task reminder coordinator', () => {
  function createMockLocal(): LocalNotificationService & {
    scheduled: string[];
    cancelled: string[];
  } {
    const scheduled: string[] = [];
    const cancelled: string[] = [];
    return {
      scheduled,
      cancelled,
      requestPermission: jest.fn(async () => ({
        authorized: true,
        canRequest: false,
      })),
      scheduleTaskReminder: jest.fn(async reminder => {
        scheduled.push(reminder.taskId);
      }),
      cancelTaskReminder: jest.fn(async taskId => {
        cancelled.push(taskId);
      }),
      cancelAll: jest.fn(async () => undefined),
    };
  }

  it('uses a stable notification id per task', () => {
    expect(taskReminderNotificationId('abc')).toBe('task-reminder:abc');
  });

  it('schedules future reminders and cancels completed tasks', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);
    const future = new Date(Date.now() + 60_000).toISOString();

    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'Soon',
      completed: false,
      deletedAt: null,
      reminderAt: future,
      dueAt: future,
    });
    expect(local.scheduled).toEqual(['t1']);

    await coordinator.syncReminderForTask({
      id: 't1',
      title: 'Soon',
      completed: true,
      deletedAt: null,
      reminderAt: future,
      dueAt: future,
    });
    expect(local.cancelled).toContain('t1');
  });

  it('cancels when reminder is cleared', async () => {
    const local = createMockLocal();
    const coordinator = createTaskReminderCoordinator(local);

    await coordinator.syncReminderForTask({
      id: 't2',
      title: 'No reminder',
      completed: false,
      deletedAt: null,
      reminderAt: null,
      dueAt: '2026-12-01T12:00:00.000Z',
    });
    expect(local.cancelled).toContain('t2');
    expect(local.scheduled).toHaveLength(0);
  });
});
