/**
 * @format
 */

import {
  emptyTaskFormValues,
  taskToFormValues,
  toUpdateTaskInput,
  validateTaskForm,
} from '../src/features/tasks/utils/validateTaskForm';
import {toDateInputValue} from '../src/utils/dateInput';

function daysFromToday(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
}

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
    const dueDate = daysFromToday(2);
    const result = validateTaskForm({
      title: 'Buy milk',
      description: '2%',
      dueDate,
      remindOnDueDate: true,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.createInput.title).toBe('Buy milk');
      expect(result.createInput.description).toBe('2%');
      expect(result.createInput.dueAt).toContain(dueDate);
      expect(result.createInput.reminderAt).toBe(result.createInput.dueAt);
    }
  });

  it('omits reminder when toggle is off', () => {
    const result = validateTaskForm({
      title: 'Buy milk',
      description: '',
      dueDate: daysFromToday(2),
      remindOnDueDate: false,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.createInput.reminderAt).toBeNull();
    }
  });

  it('rejects impossible calendar dates', () => {
    const result = validateTaskForm({
      title: 'Bad date',
      description: '',
      dueDate: '2026-02-31',
      remindOnDueDate: false,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.dueDate).toMatch(/valid date/i);
    }
  });

  it('rejects past due dates when a reminder is enabled', () => {
    const result = validateTaskForm({
      title: 'Late reminder',
      description: '',
      dueDate: daysFromToday(-2),
      remindOnDueDate: true,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.dueDate).toMatch(/future|today/i);
    }
  });

  it('allows past due dates without a reminder', () => {
    const result = validateTaskForm({
      title: 'Already due',
      description: '',
      dueDate: daysFromToday(-2),
      remindOnDueDate: false,
    });
    expect(result.valid).toBe(true);
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

    const update = toUpdateTaskInput('task-1', {
      ...values,
      dueDate: daysFromToday(3),
    });
    expect(update.valid).toBe(true);
    if (update.valid) {
      expect(update.input.id).toBe('task-1');
      expect(update.input.title).toBe('Ship it');
      expect(update.input.reminderAt).toBeTruthy();
    }
  });
});
