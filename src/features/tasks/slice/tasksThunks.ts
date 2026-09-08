import {createAsyncThunk} from '@reduxjs/toolkit';

import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@features/tasks/types';
import type {ISODateString, UniqueId} from '@app-types/common';
import {toISODateString} from '@utils/date';
import {refreshPendingSyncCount} from '@features/sync/slice/syncThunks';

import {
  requireTaskReminderCoordinator,
  requireTaskUseCases,
} from '@store/dependencies';
import type {RootState} from '@store/rootReducer';
import {toUserMessage} from '@utils/errors';

function requireUserId(state: RootState): UniqueId {
  const userId = state.auth.user?.uid;
  if (!userId) {
    throw new Error('You must be signed in to manage tasks.');
  }

  return userId;
}

export const loadTasks = createAsyncThunk<
  {tasks: Task[]; hydratedAt: ISODateString},
  TaskFilters | undefined,
  {state: RootState; rejectValue: string}
>('tasks/loadTasks', async (filters, {getState, rejectWithValue}) => {
  try {
    const userId = requireUserId(getState());
    const tasks = await requireTaskUseCases().listTasks(userId, filters);
    return {tasks, hydratedAt: toISODateString()};
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Failed to load tasks.'));
  }
});

export const createTask = createAsyncThunk<
  Task,
  CreateTaskInput,
  {state: RootState; rejectValue: string}
>('tasks/createTask', async (input, {getState, dispatch, rejectWithValue}) => {
  try {
    const userId = requireUserId(getState());
    const task = await requireTaskUseCases().createTask(userId, input);
    await requireTaskReminderCoordinator().syncReminderForTask(task);
    await dispatch(refreshPendingSyncCount());
    return task;
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Failed to create task.'));
  }
});

export const updateTask = createAsyncThunk<
  Task,
  UpdateTaskInput,
  {state: RootState; rejectValue: string}
>('tasks/updateTask', async (input, {getState, dispatch, rejectWithValue}) => {
  try {
    const userId = requireUserId(getState());
    const task = await requireTaskUseCases().updateTask(userId, input);
    await requireTaskReminderCoordinator().syncReminderForTask(task);
    await dispatch(refreshPendingSyncCount());
    return task;
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Failed to update task.'));
  }
});

export const deleteTask = createAsyncThunk<
  UniqueId,
  UniqueId,
  {state: RootState; rejectValue: string}
>('tasks/deleteTask', async (taskId, {getState, dispatch, rejectWithValue}) => {
  try {
    const userId = requireUserId(getState());
    await requireTaskUseCases().deleteTask(userId, taskId);
    await requireTaskReminderCoordinator().cancelReminder(taskId);
    await dispatch(refreshPendingSyncCount());
    return taskId;
  } catch (error) {
    return rejectWithValue(toUserMessage(error, 'Failed to delete task.'));
  }
});

export const toggleTaskCompleted = createAsyncThunk<
  Task,
  UniqueId,
  {state: RootState; rejectValue: string}
>(
  'tasks/toggleTaskCompleted',
  async (taskId, {getState, dispatch, rejectWithValue}) => {
    try {
      const userId = requireUserId(getState());
      const task = await requireTaskUseCases().toggleCompleted(userId, taskId);
      await requireTaskReminderCoordinator().syncReminderForTask(task);
      await dispatch(refreshPendingSyncCount());
      return task;
    } catch (error) {
      return rejectWithValue(
        toUserMessage(error, 'Failed to update task completion.'),
      );
    }
  },
);
