import type {
  ISODateString,
  SyncStatus,
  UniqueId,
} from '@app-types/common';

export interface Task {
  id: UniqueId;
  userId: UniqueId;
  title: string;
  description: string | null;
  completed: boolean;
  dueAt: ISODateString | null;
  reminderAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  syncStatus: SyncStatus;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueAt?: ISODateString | null;
  reminderAt?: ISODateString | null;
}

export interface UpdateTaskInput {
  id: UniqueId;
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueAt?: ISODateString | null;
  reminderAt?: ISODateString | null;
}

export interface TaskFilters {
  completed?: boolean;
  includeDeleted?: boolean;
}

export interface TasksState {
  items: Task[];
  selectedTaskId: UniqueId | null;
  isLoading: boolean;
  errorMessage: string | null;
}
