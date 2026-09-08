/**
 * @format
 */

import {
  emptyTaskFormValues,
  taskToFormValues,
  toUpdateTaskInput,
  validateTaskForm,
} from '../src/features/tasks/utils/validateTaskForm';

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

  it('accepts a valid create payload', () => {
    const result = validateTaskForm({
      title: 'Buy milk',
      description: '2%',
      dueDate: '2026-09-10',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.createInput.title).toBe('Buy milk');
      expect(result.createInput.description).toBe('2%');
      expect(result.createInput.dueAt).toContain('2026-09-10');
    }
  });

  it('maps task values for edit', () => {
    const values = taskToFormValues({
      title: 'Ship it',
      description: null,
      dueAt: '2026-09-10T12:00:00.000Z',
    });
    expect(values).toEqual({
      title: 'Ship it',
      description: '',
      dueDate: '2026-09-10',
    });

    const update = toUpdateTaskInput('task-1', values);
    expect(update.valid).toBe(true);
    if (update.valid) {
      expect(update.input.id).toBe('task-1');
      expect(update.input.title).toBe('Ship it');
    }
  });
});
