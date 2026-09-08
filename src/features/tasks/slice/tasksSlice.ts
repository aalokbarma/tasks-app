import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {Task, TasksState} from '@features/tasks/types';
import type {ISODateString, UniqueId} from '@app-types/common';

import {
  createTask,
  deleteTask,
  loadTasks,
  toggleTaskCompleted,
  updateTask,
} from './tasksThunks';

const initialState: TasksState = {
  items: [],
  selectedTaskId: null,
  isLoading: false,
  isSaving: false,
  errorMessage: null,
  lastHydratedAt: null,
};

function upsertTask(items: Task[], task: Task): Task[] {
  const index = items.findIndex(item => item.id === task.id);
  if (index === -1) {
    return [task, ...items];
  }

  const next = items.slice();
  next[index] = task;
  return next;
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.errorMessage = null;
    },
    setTasksLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setTasksError(state, action: PayloadAction<string | null>) {
      state.errorMessage = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },
    selectTask(state, action: PayloadAction<UniqueId | null>) {
      state.selectedTaskId = action.payload;
    },
    taskUpdated(state, action: PayloadAction<Task>) {
      state.items = upsertTask(state.items, action.payload);
    },
    taskRemoved(state, action: PayloadAction<UniqueId>) {
      state.items = state.items.filter(task => task.id !== action.payload);
      if (state.selectedTaskId === action.payload) {
        state.selectedTaskId = null;
      }
    },
    setLastHydratedAt(state, action: PayloadAction<ISODateString | null>) {
      state.lastHydratedAt = action.payload;
    },
    resetTasksState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadTasks.pending, state => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.tasks;
        state.lastHydratedAt = action.payload.hydratedAt;
        state.errorMessage = null;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload ?? 'Failed to load tasks.';
      })
      .addCase(createTask.pending, state => {
        state.isSaving = true;
        state.errorMessage = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = upsertTask(state.items, action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isSaving = false;
        state.errorMessage = action.payload ?? 'Failed to create task.';
      })
      .addCase(updateTask.pending, state => {
        state.isSaving = true;
        state.errorMessage = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = upsertTask(state.items, action.payload);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isSaving = false;
        state.errorMessage = action.payload ?? 'Failed to update task.';
      })
      .addCase(deleteTask.pending, state => {
        state.isSaving = true;
        state.errorMessage = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = state.items.filter(task => task.id !== action.payload);
        if (state.selectedTaskId === action.payload) {
          state.selectedTaskId = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isSaving = false;
        state.errorMessage = action.payload ?? 'Failed to delete task.';
      })
      .addCase(toggleTaskCompleted.pending, state => {
        state.isSaving = true;
        state.errorMessage = null;
      })
      .addCase(toggleTaskCompleted.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = upsertTask(state.items, action.payload);
      })
      .addCase(toggleTaskCompleted.rejected, (state, action) => {
        state.isSaving = false;
        state.errorMessage =
          action.payload ?? 'Failed to update task completion.';
      });
  },
});

export const {
  setTasks,
  setTasksLoading,
  setTasksError,
  selectTask,
  taskUpdated,
  taskRemoved,
  setLastHydratedAt,
  resetTasksState,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;
