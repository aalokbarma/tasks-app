import type {RootState} from '@store/rootReducer';

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectRememberedEmail = (state: RootState) =>
  state.auth.rememberedEmail;
export const selectIsAuthenticating = (state: RootState) =>
  state.auth.isAuthenticating;
export const selectAuthError = (state: RootState) => state.auth.errorMessage;

export const selectTasks = (state: RootState) => state.tasks.items;
export const selectSelectedTaskId = (state: RootState) =>
  state.tasks.selectedTaskId;
export const selectTasksLoading = (state: RootState) => state.tasks.isLoading;
export const selectTasksSaving = (state: RootState) => state.tasks.isSaving;
export const selectTasksError = (state: RootState) => state.tasks.errorMessage;
export const selectSelectedTask = (state: RootState) => {
  const selectedId = state.tasks.selectedTaskId;
  if (!selectedId) {
    return null;
  }

  return state.tasks.items.find(task => task.id === selectedId) ?? null;
};

export const selectNetworkStatus = (state: RootState) => state.network.status;
export const selectIsOnline = (state: RootState) =>
  state.network.status === 'online';

export const selectSyncState = (state: RootState) => state.sync;
export const selectPendingSyncCount = (state: RootState) =>
  state.sync.pendingCount;
export const selectIsSyncing = (state: RootState) => state.sync.isSyncing;

export const selectThemeMode = (state: RootState) => state.theme.mode;
