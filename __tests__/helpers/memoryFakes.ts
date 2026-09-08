import type {UniqueId} from '@app-types/common';
import type {
  AuthCredentials,
  AuthService,
  AuthSession,
  AuthUser,
  SignUpInput,
} from '@features/auth/types';
import type {SyncQueueItem, SyncQueueRepository} from '@features/sync/types';
import type {TaskRepository} from '@features/tasks/repositories/TaskRepository';
import type {TaskRemoteDataSource} from '@features/tasks/services/TaskRemoteDataSource';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@features/tasks/types';
import {nextSyncStatusAfterLocalUpdate} from '@database/mappers/taskMapper';
import type {
  ConnectivityService,
  NetworkSnapshot,
} from '@services/network/connectivity';
import {AppFirebaseError} from '@services/firebase/errors';
import {toISODateString} from '@utils/date';
import {createId} from '@utils/id';

export function makeTask(
  partial: Partial<Task> & Pick<Task, 'id' | 'title' | 'syncStatus'>,
): Task {
  const now = '2026-09-08T10:00:00.000Z';
  return {
    userId: 'user-1',
    description: null,
    completed: false,
    dueAt: null,
    reminderAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...partial,
  };
}

/**
 * In-memory TaskRepository mirroring SQLite offline-first semantics
 * (created/updated/deleted syncStatus) without touching Nitro SQLite.
 */
export function createMemoryTaskRepository(
  seed: Task[] = [],
): TaskRepository & {readonly store: Map<UniqueId, Task>} {
  const store = new Map<UniqueId, Task>(seed.map(item => [item.id, item]));

  const repository: TaskRepository & {store: Map<UniqueId, Task>} = {
    store,

    async getAll(userId, filters) {
      return [...store.values()].filter(item => {
        if (item.userId !== userId) {
          return false;
        }
        if (!filters?.includeDeleted && item.deletedAt) {
          return false;
        }
        if (
          typeof filters?.completed === 'boolean' &&
          item.completed !== filters.completed
        ) {
          return false;
        }
        return true;
      });
    },

    async getById(userId, taskId) {
      const found = store.get(taskId);
      return found && found.userId === userId ? found : null;
    },

    async create(userId, input: CreateTaskInput) {
      const now = toISODateString();
      const title = input.title.trim();
      if (!title) {
        throw new Error('Task title is required.');
      }

      const task: Task = {
        id: createId(),
        userId,
        title,
        description: input.description ?? null,
        completed: false,
        dueAt: input.dueAt ?? null,
        reminderAt: input.reminderAt ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        syncStatus: 'created',
      };
      store.set(task.id, task);
      return task;
    },

    async update(userId, input: UpdateTaskInput) {
      const existing = await repository.getById(userId, input.id);
      if (!existing) {
        throw new Error(`Task "${input.id}" was not found.`);
      }
      if (existing.deletedAt) {
        throw new Error(`Task "${input.id}" is deleted.`);
      }

      const title =
        input.title !== undefined ? input.title.trim() : existing.title;
      if (!title) {
        throw new Error('Task title is required.');
      }

      const updated: Task = {
        ...existing,
        title,
        description:
          input.description !== undefined
            ? input.description
            : existing.description,
        completed:
          input.completed !== undefined ? input.completed : existing.completed,
        dueAt: input.dueAt !== undefined ? input.dueAt : existing.dueAt,
        reminderAt:
          input.reminderAt !== undefined
            ? input.reminderAt
            : existing.reminderAt,
        updatedAt: toISODateString(),
        syncStatus: nextSyncStatusAfterLocalUpdate(existing.syncStatus),
      };
      store.set(updated.id, updated);
      return updated;
    },

    async delete(userId, taskId) {
      const existing = await repository.getById(userId, taskId);
      if (!existing || existing.deletedAt) {
        return;
      }

      if (existing.syncStatus === 'created') {
        store.delete(taskId);
        return;
      }

      const now = toISODateString();
      store.set(taskId, {
        ...existing,
        deletedAt: now,
        updatedAt: now,
        syncStatus: 'deleted',
      });
    },

    async setCompleted(userId, taskId, completed) {
      return repository.update(userId, {id: taskId, completed});
    },

    async upsertMany(userId, items) {
      for (const item of items) {
        if (item.userId !== userId) {
          throw new Error('user mismatch');
        }
        store.set(item.id, item);
      }
    },

    async getPendingSync(userId) {
      return [...store.values()].filter(
        item =>
          item.userId === userId &&
          ['created', 'updated', 'deleted', 'pending'].includes(
            item.syncStatus,
          ),
      );
    },

    async markSynchronized(userId, taskIds) {
      for (const id of taskIds) {
        const existing = store.get(id);
        if (existing && existing.userId === userId) {
          store.set(id, {...existing, syncStatus: 'synced'});
        }
      }
    },
  };

  return repository;
}

export function createMemoryQueueRepository(
  seed: SyncQueueItem[] = [],
): SyncQueueRepository & {items: SyncQueueItem[]} {
  const items = [...seed];

  return {
    items,
    async enqueue(input) {
      const item: SyncQueueItem = {
        id: input.id ?? `queue-${items.length + 1}`,
        entityType: 'task',
        entityId: input.entityId,
        operation: input.operation,
        payloadJson: input.payloadJson,
        attempts: 0,
        lastError: null,
        createdAt: '2026-09-08T10:00:00.000Z',
      };
      items.push(item);
      return item;
    },
    async listPending(limit) {
      return items.slice(0, limit);
    },
    async markAttempt(id, errorMessage) {
      const item = items.find(entry => entry.id === id);
      if (!item) {
        throw new Error(`missing ${id}`);
      }
      item.attempts += 1;
      item.lastError = errorMessage;
    },
    async remove(id) {
      const index = items.findIndex(entry => entry.id === id);
      if (index >= 0) {
        items.splice(index, 1);
      }
    },
    async markSynchronized(ids) {
      for (const id of [...ids]) {
        const index = items.findIndex(entry => entry.id === id);
        if (index >= 0) {
          items.splice(index, 1);
        }
      }
    },
    async countPending() {
      return items.length;
    },
  };
}

export function createMemoryRemote(seed: Task[] = []): TaskRemoteDataSource & {
  store: Map<UniqueId, Task>;
  failNextUpserts: number;
} {
  const store = new Map(seed.map(item => [item.id, item]));

  return {
    store,
    failNextUpserts: 0,
    async fetchAll() {
      return [...store.values()];
    },
    async upsert(_userId, next) {
      if (this.failNextUpserts > 0) {
        this.failNextUpserts -= 1;
        throw new Error('network blip');
      }
      store.set(next.id, next);
    },
    async remove(_userId, taskId) {
      store.delete(taskId);
    },
  };
}

export function createMemoryConnectivity(
  initial: NetworkSnapshot = {
    status: 'online',
    isInternetReachable: true,
  },
): ConnectivityService & {
  snapshot: NetworkSnapshot;
  listeners: Array<(snapshot: NetworkSnapshot) => void>;
  goOnline: () => void;
  goOffline: () => void;
} {
  const listeners: Array<(snapshot: NetworkSnapshot) => void> = [];
  const service = {
    snapshot: initial,
    listeners,
    async getStatus() {
      return service.snapshot;
    },
    subscribe(listener: (snapshot: NetworkSnapshot) => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    },
    goOnline() {
      service.snapshot = {status: 'online', isInternetReachable: true};
      listeners.forEach(listener => listener(service.snapshot));
    },
    goOffline() {
      service.snapshot = {status: 'offline', isInternetReachable: false};
      listeners.forEach(listener => listener(service.snapshot));
    },
  };

  return service;
}

export function wireQueueClearOnMark(
  local: TaskRepository,
  queue: SyncQueueRepository & {items: SyncQueueItem[]},
): void {
  const originalMark = local.markSynchronized.bind(local);
  local.markSynchronized = async (userId, ids) => {
    await originalMark(userId, ids);
    await queue.markSynchronized(
      queue.items
        .filter(item => ids.includes(item.entityId))
        .map(item => item.id),
    );
  };
}

export function createFakeAuthService(options?: {
  users?: Array<{email: string; password: string; user: AuthUser}>;
}): AuthService & {
  currentUser: AuthUser | null;
  signInCalls: AuthCredentials[];
  signUpCalls: SignUpInput[];
} {
  const users = [...(options?.users ?? [])];
  const service = {
    currentUser: null as AuthUser | null,
    signInCalls: [] as AuthCredentials[],
    signUpCalls: [] as SignUpInput[],

    async getCurrentSession(): Promise<AuthSession> {
      return {
        status: service.currentUser ? 'authenticated' : 'unauthenticated',
        user: service.currentUser,
        errorMessage: null,
      };
    },

    async signIn(credentials: AuthCredentials): Promise<AuthUser> {
      service.signInCalls.push(credentials);
      const match = users.find(
        entry =>
          entry.email === credentials.email &&
          entry.password === credentials.password,
      );
      if (!match) {
        throw new AppFirebaseError(
          'auth/invalid-credential',
          'Incorrect email or password.',
        );
      }
      service.currentUser = match.user;
      return match.user;
    },

    async signUp(input: SignUpInput): Promise<AuthUser> {
      service.signUpCalls.push(input);
      if (users.some(entry => entry.email === input.email)) {
        throw new AppFirebaseError(
          'auth/email-already-in-use',
          'An account with this email already exists.',
        );
      }
      const user: AuthUser = {
        uid: `uid-${users.length + 1}`,
        email: input.email,
        displayName: input.displayName ?? null,
      };
      users.push({email: input.email, password: input.password, user});
      service.currentUser = user;
      return user;
    },

    async signOut(): Promise<void> {
      service.currentUser = null;
    },

    subscribe(listener: (session: AuthSession) => void): () => void {
      service
        .getCurrentSession()
        .then(listener)
        .catch(() => undefined);
      return () => undefined;
    },
  };

  return service;
}
