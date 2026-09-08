import type {Task} from '@features/tasks/types';

import {
  mapTaskRowToTask,
  mapTaskToRow,
  nextSyncStatusAfterLocalUpdate,
} from '@database/mappers/taskMapper';
import type {TaskRow} from '@database/schema';

describe('SQLite task mappers', () => {
  const row: TaskRow = {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Buy milk',
    description: null,
    completed: 0,
    due_at: '2026-09-10T10:00:00.000Z',
    reminder_at: null,
    created_at: '2026-09-08T10:00:00.000Z',
    updated_at: '2026-09-08T10:00:00.000Z',
    deleted_at: null,
    sync_status: 'created',
  };

  it('maps a task row to the domain Task model', () => {
    expect(mapTaskRowToTask(row)).toEqual({
      id: 'task-1',
      userId: 'user-1',
      title: 'Buy milk',
      description: null,
      completed: false,
      dueAt: '2026-09-10T10:00:00.000Z',
      reminderAt: null,
      createdAt: '2026-09-08T10:00:00.000Z',
      updatedAt: '2026-09-08T10:00:00.000Z',
      deletedAt: null,
      syncStatus: 'created',
    });
  });

  it('maps a domain Task back to a SQLite row', () => {
    const task: Task = mapTaskRowToTask(row);
    expect(
      mapTaskToRow({...task, completed: true, syncStatus: 'updated'}),
    ).toEqual({
      ...row,
      completed: 1,
      sync_status: 'updated',
    });
  });

  it('keeps created status until the first successful sync', () => {
    expect(nextSyncStatusAfterLocalUpdate('created')).toBe('created');
    expect(nextSyncStatusAfterLocalUpdate('synced')).toBe('updated');
    expect(nextSyncStatusAfterLocalUpdate('updated')).toBe('updated');
    expect(nextSyncStatusAfterLocalUpdate('pending')).toBe('updated');
  });

  it('rejects corrupt rows with empty titles', () => {
    expect(() =>
      mapTaskRowToTask({
        ...row,
        title: '   ',
      }),
    ).toThrow(/invalid/i);
  });
});
