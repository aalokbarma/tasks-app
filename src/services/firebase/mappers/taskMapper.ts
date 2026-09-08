import type {DocumentSnapshot} from '@react-native-firebase/firestore';

import type {ISODateString, SyncStatus, UniqueId} from '@app-types/common';
import type {Task} from '@features/tasks/types';

export interface FirestoreTaskDocument {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueAt: string | null;
  reminderAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function toISODateString(value: unknown): ISODateString | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as {toDate: unknown}).toDate === 'function'
  ) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return null;
}

export function mapTaskToFirestoreDocument(task: Task): FirestoreTaskDocument {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    dueAt: task.dueAt,
    reminderAt: task.reminderAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    deletedAt: task.deletedAt,
  };
}

export function mapFirestoreDocumentToTask(
  userId: UniqueId,
  snapshot: DocumentSnapshot,
): Task | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  if (!data) {
    return null;
  }

  const createdAt = toISODateString(data.createdAt) ?? new Date().toISOString();
  const updatedAt = toISODateString(data.updatedAt) ?? createdAt;
  const syncStatus: SyncStatus = 'synced';

  return {
    id: asString(data.id) ?? snapshot.id,
    userId: asString(data.userId) ?? userId,
    title: asString(data.title) ?? '',
    description: asString(data.description),
    completed: asBoolean(data.completed),
    dueAt: toISODateString(data.dueAt),
    reminderAt: toISODateString(data.reminderAt),
    createdAt,
    updatedAt,
    deletedAt: toISODateString(data.deletedAt),
    syncStatus,
  };
}
