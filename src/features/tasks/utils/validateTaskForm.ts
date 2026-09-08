import type {CreateTaskInput, UpdateTaskInput} from '../types';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  /** When true and due date is set, schedules a local reminder at due time. */
  remindOnDueDate: boolean;
}

export interface TaskFormErrors {
  title?: string;
  dueDate?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function parseDueDate(dueDate: string): string | null | undefined {
  const trimmed = dueDate.trim();
  if (!trimmed) {
    return null;
  }

  if (!DATE_PATTERN.test(trimmed)) {
    return undefined;
  }

  const parsed = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
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
    errors.dueDate = 'Use YYYY-MM-DD for the due date.';
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
