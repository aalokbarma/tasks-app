import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {Task, TasksState} from '@features/tasks/types';
import type {UniqueId} from '@app-types/common';

const initialState: TasksState = {
  items: [],
  selectedTaskId: null,
  isLoading: false,
  errorMessage: null,
};

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
    },
    selectTask(state, action: PayloadAction<UniqueId | null>) {
      state.selectedTaskId = action.payload;
    },
    resetTasksState() {
      return initialState;
    },
  },
});

export const {
  setTasks,
  setTasksLoading,
  setTasksError,
  selectTask,
  resetTasksState,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;
