import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';

import type {UniqueId} from '@app-types/common';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import type {Task} from '@features/tasks/types';

import {getFirebaseAppHandle} from './app';
import {ensureFirebaseReady, mapFirestoreError} from './errors';
import {
  mapFirestoreDocumentToTask,
  mapTaskToFirestoreDocument,
} from './mappers/taskMapper';

function tasksCollection(userId: UniqueId) {
  return collection(getFirestore(), 'users', userId, 'tasks');
}

function taskDocument(userId: UniqueId, taskId: UniqueId) {
  return doc(getFirestore(), 'users', userId, 'tasks', taskId);
}

/**
 * Low-level Firestore access used by remote adapters.
 * Feature modules should depend on TaskRemoteDataSource / repositories, not this.
 */
export interface FirestoreService {
  getTask(userId: UniqueId, taskId: UniqueId): Promise<Task | null>;
  listTasks(userId: UniqueId): Promise<Task[]>;
  setTask(userId: UniqueId, task: Task): Promise<void>;
  deleteTask(userId: UniqueId, taskId: UniqueId): Promise<void>;
}

export function createFirestoreService(): FirestoreService {
  return {
    async getTask(userId, taskId) {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        const snapshot = await getDoc(taskDocument(userId, taskId));
        return mapFirestoreDocumentToTask(userId, snapshot);
      } catch (error) {
        throw mapFirestoreError(error);
      }
    },

    async listTasks(userId) {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        const snapshot = await getDocs(tasksCollection(userId));

        return snapshot.docs
          .map(document => mapFirestoreDocumentToTask(userId, document))
          .filter((task): task is Task => task !== null);
      } catch (error) {
        throw mapFirestoreError(error);
      }
    },

    async setTask(userId, task) {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        await setDoc(taskDocument(userId, task.id), mapTaskToFirestoreDocument(task), {
          merge: true,
        });
      } catch (error) {
        throw mapFirestoreError(error);
      }
    },

    async deleteTask(userId, taskId) {
      try {
        ensureFirebaseReady(getFirebaseAppHandle().ready);
        await deleteDoc(taskDocument(userId, taskId));
      } catch (error) {
        throw mapFirestoreError(error);
      }
    },
  };
}

/**
 * Firestore adapter for tasks. Used by sync composition root only —
 * never imported by the tasks UI feature module.
 */
export function createFirestoreTaskRemoteDataSource(
  firestoreService: FirestoreService = createFirestoreService(),
): TaskRemoteDataSource {
  return {
    fetchAll: userId => firestoreService.listTasks(userId),
    upsert: (userId, task) => firestoreService.setTask(userId, task),
    remove: (userId, taskId) => firestoreService.deleteTask(userId, taskId),
  };
}
