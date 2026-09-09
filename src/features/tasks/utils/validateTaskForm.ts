import type {CreateTaskInput, UpdateTaskInput} from '../types';
import {
  isBeforeLocalToday,
  isValidCalendarDateString,
} from '@utils/dateInput';

export interface TaskFormValues {
  title: string;
  description: string;
  /** Local calendar day as YYYY-MM-DD, or empty when unset. */
  dueDate: string;
  /** When true and due date is set, schedules a local reminder at due time. */
  remindOnDueDate: boolean;
}

export interface TaskFormErrors {
  title?: string;
  dueDate?: string;
}

export function emptyTaskFormValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    dueDate: '',
    remindOnDueDate: true,
  };
}

export function taskToFormValues(task: {
  title: string;
  description: string | null;
  dueAt: string | null;
  reminderAt: string | null;
}): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    dueDate: task.dueAt ? task.dueAt.slice(0, 10) : '',
    remindOnDueDate: Boolean(task.reminderAt ?? task.dueAt),
  };
}

/**
 * Parses YYYY-MM-DD into a noon-UTC ISO timestamp for storage/sync stability.
 * Returns:
 * - `null` when empty
 * - `undefined` when invalid
 */
function parseDueDate(dueDate: string): string | null | undefined {
  const trimmed = dueDate.trim();
  if (!trimmed) {
    return null;
  }

  if (!isValidCalendarDateString(trimmed)) {
    return undefined;
  }

  return new Date(`${trimmed}T12:00:00.000Z`).toISOString();
}

export function validateTaskForm(
  values: TaskFormValues,
):
  | {valid: true; createInput: CreateTaskInput}
  | {valid: false; errors: TaskFormErrors} {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > 120) {
    errors.title = 'Title must be 120 characters or fewer.';
  }

  const dueAt = parseDueDate(values.dueDate);
  if (dueAt === undefined) {
    errors.dueDate = 'Choose a valid date from the calendar.';
  } else if (
    values.remindOnDueDate &&
    values.dueDate.trim() &&
    isBeforeLocalToday(values.dueDate.trim())
  ) {
    errors.dueDate =
      'Reminders need today or a future date. Clear the reminder or pick another day.';
  }

  if (Object.keys(errors).length > 0) {
    return {valid: false, errors};
  }

  const description = values.description.trim();
  const reminderAt = dueAt && values.remindOnDueDate ? dueAt : null;

  return {
    valid: true,
    createInput: {
      title,
      description: description.length > 0 ? description : null,
      dueAt: dueAt ?? null,
      reminderAt,
    },
  };
}

export function toUpdateTaskInput(
  taskId: string,
  values: TaskFormValues,
):
  | {valid: true; input: UpdateTaskInput}
  | {valid: false; errors: TaskFormErrors} {
  const result = validateTaskForm(values);
  if (!result.valid) {
    return result;
  }

  return {
    valid: true,
    input: {
      id: taskId,
      title: result.createInput.title,
      description: result.createInput.description,
      dueAt: result.createInput.dueAt,
      reminderAt: result.createInput.reminderAt,
    },
  };
}
