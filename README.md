# TasksApp

Cross-platform task management app (React Native CLI + TypeScript) for a team-lead take-home assignment.

## Current status

Scaffold, multi-env config, Firebase adapters, SQLite offline persistence, Redux Toolkit, email/password authentication, React Navigation, offline-first task CRUD, and the **offline→online SyncManager** are in place. Local notifications are still upcoming.

## Architecture

```
UI (screens/components)
  → hooks
  → Redux / use cases
  → repositories & service interfaces
  → SQLite (local) / Firebase (remote adapters)
```

- **SQLite** is the local source of truth for tasks (and the UI). Redux holds a hydrated cache only — never a second full database copy.
- **Firestore** (`users/{userId}/tasks/{taskId}`) is the remote source of truth for cross-device sync.
- **Auth** uses an `AuthRepository` port (Firebase adapter underneath). Screens never import Firebase.
- **SyncManager** watches NetInfo; when connectivity returns it pushes the durable outbox, pulls remote tasks, and reconciles without wiping dirty local rows.
- **Redux slices**: `auth`, `tasks`, `network`, `theme`, `sync`.
- **redux-persist** whitelists only `auth.rememberedEmail` and `theme.mode`.
- Task queries and Firestore paths are always scoped by the signed-in `userId`.

### Offline → online sync

```
LOCAL MUTATION
→ SQLite transaction
→ mark syncStatus (created | updated | deleted)
→ enqueue sync_queue row
→ UI updates immediately (no network wait)

NETWORK ONLINE
→ SyncManager.flush() (single-flight)
→ push pending dirty tasks (idempotent upsert/delete)
→ pull remote tasks
→ reconcile (LWW by updatedAt)
→ mark synchronized / record attempts
```

**Conflict resolution (Last-Write-Wins by `updatedAt`):**

1. Push always runs before pull, so offline local mutations are authoritative until acknowledged remotely.
2. Pull never overwrites a dirty local row (`syncStatus !== 'synced'`).
3. For synced locals, a remote document wins only when `remote.updatedAt > local.updatedAt`.
4. Remote-only tasks are inserted locally as `synced`.
5. Synced locals missing from Firestore are tombstoned locally (remote delete) without enqueueing another outbox delete.
6. Failed pushes increment durable `sync_queue.attempts` (survives restart). After `SYNC_MAX_ATTEMPTS` the entity is skipped to avoid infinite retry loops; other entities still sync.
7. Concurrent `flush()` calls share one in-flight promise (no parallel sync runs).

## Folder structure

```
src/
  app/            # App entry, providers, dependency composition
  components/     # Shared UI / layout
  config/         # Env + constants (typed getAppConfig / getEnv)
  database/       # SQLite client, schema, repository adapters
  features/       # auth, tasks, sync, notifications, settings
  hooks/          # Shared typed Redux hooks
  navigation/     # RootNavigator, AuthNavigator, AppNavigator, Splash
  services/       # Firebase, network, notifications, storage adapters
  store/          # Redux Toolkit store
  theme/          # Light/dark design tokens + ThemeProvider
  types/          # Shared domain primitive types
  utils/          # Pure helpers
```

Path aliases: `@app`, `@components`, `@config`, `@database`, `@features`, `@hooks`, `@navigation`, `@services`, `@store`, `@theme`, `@app-types`, `@utils`.

## Environments

Supported: **development**, **staging**, **production**.

Mechanism: [`react-native-config`](https://github.com/luggit/react-native-config) with:

| Platform | Approach |
|----------|----------|
| Android | Product flavors `development` / `staging` / `production` mapped to `.env.*` via `dotenv.gradle` |
| iOS | Shared Xcode schemes + `ENVFILE`, with Podfile fallback Debug→development / Release→production |
| JS | Typed module `src/config/env.ts` |

### Env files

| File | Git | Purpose |
|------|-----|---------|
| `.env.development.example` | committed | Safe template |
| `.env.staging.example` | committed | Safe template |
| `.env.production.example` | committed | Safe template |
| `.env.development` | **ignored** | Local values |
| `.env.staging` | **ignored** | Local values |
| `.env.production` | **ignored** | Local values |

Variables (Firebase public web config only — never private keys):

```
APP_ENV
APP_NAME
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

### Setup

```sh
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
# Edit the .env.* files with your Firebase project values
```

Typed access:

```ts
import {getAppConfig, getEnv, getFirebaseEnv} from '@config/env';

getEnv().FIREBASE_PROJECT_ID;
getFirebaseEnv().FIREBASE_API_KEY;
getAppConfig().firebase; // null until all Firebase keys are set
```

## Run commands

Defaults (`npm start`, `npm run ios`, `npm run android`) use **development**.

### Metro

```sh
npm run start:development
npm run start:staging
npm run start:production
```

### iOS

```sh
npm run ios:development
npm run ios:staging
npm run ios:production
```

Xcode schemes: `tasksapp-development`, `tasksapp-staging`, `tasksapp-production`.

### Android

```sh
npm run android:development
npm run android:staging
npm run android:production

# Release variants
npm run android:development:release
npm run android:staging:release
npm run android:production:release
```

Application IDs:

- development → `com.tasksapp.dev`
- staging → `com.tasksapp.staging`
- production → `com.tasksapp`

### Checks

```sh
npm run typecheck
npm run lint
npm test
```

## Libraries

| Area | Packages |
|------|----------|
| Navigation | `@react-navigation/native`, `native-stack`, `screens`, `gesture-handler` (`2.32.0+`, Kotlin 2.2 fix), `safe-area-context` |
| State | `@reduxjs/toolkit`, `react-redux`, `redux-persist` |
| Config | `react-native-config` |
| IDs | `uuid` |

Deferred installs (next phases): `@notifee/react-native`, `@react-native-community/netinfo`, Firestore sync engine.

Installed infrastructure:
- Firebase: `@react-native-firebase/app|auth|firestore|messaging` (`26.4.0`)
- SQLite: `react-native-nitro-sqlite` + `react-native-nitro-modules` (offline-first local source of truth)

## Limitations

- No Firebase Auth / SQLite / sync / notification behavior yet.
- Empty Firebase env values are valid for scaffold; `getAppConfig().firebase` stays `null` until filled.
- After changing the Podfile, run `bundle exec pod install --project-directory=ios`.

## First-time setup

**Node.js:** React Native `0.87` expects `^22.13.0 || ^24.3.0 || >=26.0.0` (Node **23** is not listed). This repo includes `.nvmrc` (`22.13.0`) and `.yarnrc` (`ignore-engines true`) so Yarn can still install on unsupported local Node versions. Prefer:

```sh
nvm install
nvm use
```

```sh
npm install
# or: yarn install
bundle install
bundle exec pod install --project-directory=ios
cp .env.development.example .env.development
npm run start:development
npm run ios:development   # or npm run android:development
```
