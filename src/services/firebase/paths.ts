import type {UniqueId} from '@app-types/common';

export function userDocumentPath(userId: UniqueId): string {
  return `users/${userId}`;
}

export function userTasksCollectionPath(userId: UniqueId): string {
  return `users/${userId}/tasks`;
}

export function userTaskDocumentPath(
  userId: UniqueId,
  taskId: UniqueId,
): string {
  return `users/${userId}/tasks/${taskId}`;
}
