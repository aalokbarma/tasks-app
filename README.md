# Task Management App

Cross-platform offline-first task manager built with **React Native CLI** and **TypeScript** as a take-home assignment.

---

## Overview

TasksApp lets a signed-in user create, edit, complete, and delete tasks with optional due dates and local reminders. The app is designed **offline-first**: every mutation is written to SQLite immediately, shown in the UI without waiting on the network, and synchronized to Firestore when connectivity is available.

Firebase Authentication (email/password) gates the app. React Navigation isolates auth and app flows. Redux Toolkit holds a **hydrated UI cache** and sync/network status — not a second full copy of the task database.

---

## Features

- Email/password sign-up, sign-in, and sign-out (Firebase Auth)
- Session restore on launch (`unknown` → splash → auth or app)
- Offline-capable task CRUD (create, update, delete, completion toggle)
- Due date + “remind on due date” local notifications (Notifee)
- Durable sync outbox (`sync_queue`) with retries and last-write-wins conflict handling
- Connectivity strip (offline / syncing / pending / failed) that never blocks CRUD
- Light / dark / system theme (persisted preference)
- Multi-environment builds: development, staging, production
- FCM **client** infrastructure (token registration + message display) — sending pushes requires a server

---

## Tech Stack

| Area          | Package                                                                  | Version                      |
| ------------- | ------------------------------------------------------------------------ | ---------------------------- |
| Runtime       | `react` / `react-native`                                                 | `19.2.3` / `0.87.1`          |
| Language      | `typescript`                                                             | `^6.0.3`                     |
| Navigation    | `@react-navigation/native`, `native-stack`                               | `^7.1.28`, `^7.3.16`         |
| State         | `@reduxjs/toolkit`, `react-redux`, `redux-persist`                       | `^2.12.0`, `^9.3.0`, `6.0.0` |
| Persistence   | `react-native-nitro-sqlite`, `@react-native-async-storage/async-storage` | `9.7.0`, `^2.2.0`            |
| Network       | `@react-native-community/netinfo`                                        | `11.4.1`                     |
| Firebase      | `@react-native-firebase/app\|auth\|firestore\|messaging`                 | `26.4.0`                     |
| Notifications | `@notifee/react-native`                                                  | `^9.1.8`                     |
| Config        | `react-native-config`                                                    | `^1.5.5`                     |
| IDs           | `uuid`                                                                   | `^11.1.0`                    |

Node engines: `^22.13.0 \|\| ^24.3.0 \|\| >=26.0.0` (see `.nvmrc`: `22.13.0`).

---

## Architecture

```
UI (screens / shared components)
  → presentation hooks (feature controllers)
  → Redux Toolkit (thunks + slices) / use cases
  → repository & service ports (interfaces)
  → SQLite adapters  |  Firebase adapters
```

| Layer                    | Responsibility                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **UI**                   | Screens and shared components. No direct Firebase or SQLite imports.                                                |
| **Presentation / hooks** | Feature controllers (`useAuthController`, task hooks) bind screens to Redux actions and selectors.                  |
| **Redux / use cases**    | Thunks orchestrate auth, tasks, sync, and reminders. `TaskUseCases` sit on top of `TaskRepository`.                 |
| **Repositories / ports** | `AuthRepository`, `TaskRepository`, `SyncQueueRepository`, `TaskRemoteDataSource`, notification service interfaces. |
| **Local database**       | Nitro SQLite — tasks + `sync_queue` (local source of truth).                                                        |
| **Firebase**             | Auth, Firestore remote SoT, Messaging token/handlers (adapters under `src/services/firebase`).                      |

Composition root: `src/app/dependencies.ts` (wired through `src/store/dependencies.ts` for thunks/bootstrap).

**Design rule:** SQLite is the local source of truth for tasks. Firestore is the remote source of truth for cross-device sync. Redux is a hydrated projection for the UI.

---

## Folder Structure

```
src/
  app/             # App entry, providers, dependency composition
  components/      # Shared UI (Button, TextField, banners, layout)
  config/          # Env typing, constants (DB name, sync limits)
  database/        # SQLite client, migrations, schema, repositories, mappers
  features/        # Domain modules: auth, tasks, sync, network, notifications, settings
  hooks/           # Shared hook re-exports
  navigation/      # Root / Auth / App navigators, splash, lazy fallbacks
  services/        # Firebase, NetInfo, Notifee/FCM adapters
  store/           # Redux store, bootstrap, selectors, typed hooks
  theme/           # Design tokens + ThemeProvider (light/dark/system)
  types/           # Shared primitives (UniqueId, SyncStatus, …)
  utils/           # Validation, dates, ids, error mapping / reporting

__tests__/         # Unit tests (auth, tasks, sync, notifications, …)
firebase/          # Native Firebase setup notes
firestore.rules    # Security rules (deploy separately)
android/ / ios/    # Native projects, flavors / schemes
```

Path aliases (TypeScript + Babel + Metro): `@app`, `@components`, `@config`, `@database`, `@features`, `@hooks`, `@navigation`, `@services`, `@store`, `@theme`, `@app-types`, `@utils`.

---

## Offline-First Architecture

### SQLite as local source of truth

- Database file: `tasksapp.db` (`DATABASE_NAME`).
- Task reads/writes go through `SqliteTaskRepository` inside transactions.
- The UI lists tasks from SQLite (via use cases → thunks → Redux cache). Firestore is **not** required for CRUD.

### Pending sync records

On each local mutation the repository:

1. Writes the task row with `syncStatus` of `created` | `updated` | `deleted`.
2. Enqueues a durable `sync_queue` outbox row (`create` | `update` | `delete`).

Never-synced local creates that are deleted are hard-removed (no remote delete needed). Previously synced deletes become soft-deletes (`deletedAt` + `syncStatus: 'deleted'`) and enqueue a delete operation.

### Network detection

- Shared `ConnectivityService` multiplexes a single NetInfo subscription.
- Status is mirrored into the Redux `network` slice.
- `ConnectivityStatusBar` surfaces offline / syncing / pending / failed without blocking task actions.

### Synchronization

`SyncManager` (`src/features/sync/services/syncManager.ts`):

1. Runs only when a user is signed in **and** the device is online.
2. **Push** pending dirty tasks (idempotent Firestore upsert / delete).
3. **Pull** remote tasks and reconcile into SQLite.
4. Concurrent `flush()` callers share one in-flight promise (no parallel sync runs).
5. Offline → online transitions trigger an automatic flush after `start()`.

Sync is also triggered on session restore / auth change, pull-to-refresh while online, and the connectivity retry control. Local mutations update the pending count immediately; they rely on those flush triggers (and reconnect) to push while the user remains online.

### Retries

- Failed pushes increment durable `sync_queue.attempts` (survives process death).
- After `SYNC_MAX_ATTEMPTS` (**5**), that entity is **skipped** so other work can continue (dead-letter behavior).
- Batch size: `SYNC_QUEUE_BATCH_SIZE` (**25**).

### Conflict resolution

Last-Write-Wins by `updatedAt` (`reconcileRemoteTasks`):

1. Push runs before pull so offline local mutations are authoritative until acknowledged.
2. Dirty local rows (`syncStatus !== 'synced'`) are **never** overwritten by pull.
3. Synced locals accept remote only when `remote.updatedAt > local.updatedAt`.
4. Remote-only tasks are inserted as `synced`.
5. Synced locals missing remotely are tombstoned locally (no extra outbox delete).
6. Equal timestamps keep the local copy (idempotent).

---

## Authentication

- **Provider:** Firebase Authentication — email/password.
- **Port:** `AuthRepository` validates/normalizes input, then delegates to `AuthService` (`createFirebaseAuthService`).
- Screens never import `@react-native-firebase/auth`.

### Session restoration

1. App boots with auth `status: 'unknown'` → `SplashScreen`.
2. `hydrateAuthSession` reads the current Firebase user.
3. `onAuthStateChanged` keeps Redux in sync for sign-in/out across the process lifetime.
4. Root navigator then mounts **App** or **Auth** only (inactive tree unmounts).

Sign-out clears Redux task/sync caches and cancels local notifications. Local SQLite rows are **not** wiped on logout (see Known Limitations).

---

## Firestore Data Model

User-scoped paths only:

```
users/{userId}
  fcmTokens: string[]     # device tokens (arrayUnion)
  updatedAt: string

users/{userId}/tasks/{taskId}
  id, userId, title, description, completed,
  dueAt, reminderAt, createdAt, updatedAt, deletedAt
```

Domain `Task` shape (TypeScript):

```ts
interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueAt: string | null; // ISO
  reminderAt: string | null; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null; // ISO
  syncStatus: 'synced' | 'created' | 'updated' | 'deleted' | 'pending';
}
```

`syncStatus` is a **local** SQLite concern; remote documents are treated as synced when pulled.

---

## Notifications

### Local reminders (primary)

- **Library:** `@notifee/react-native`.
- Creating/editing with “Remind on due date” schedules a trigger notification.
- Stable id: `task-reminder:{taskId}` (upsert → no duplicates).
- Android channel: `task-reminders` (HIGH importance).
- Completed, deleted, past, or cleared reminders cancel the notification.
- Login bootstraps permission + reschedules active reminders; logout cancels all local notifications.
- Permission denial is a **no-op** for reminders — CRUD still works.

### Notification permissions

- Android 13+: `POST_NOTIFICATIONS` via Notifee.
- iOS: Notifee + Messaging permission where applicable.
- Manifest also includes boot / vibrate / exact-alarm related permissions for reliable triggers.

### FCM bonus (client only)

| Piece                     | Implementation                                     |
| ------------------------- | -------------------------------------------------- |
| Permission + device token | `PushNotificationService` → Firebase Messaging     |
| Token storage             | `users/{uid}.fcmTokens` via `arrayUnion`           |
| Foreground                | `subscribeForegroundMessages()` in bootstrap       |
| Background                | `registerBackgroundMessageHandler()` in `index.js` |
| Display                   | Notifee channel `fcm-messages`                     |

**Not in the app:** Admin SDK, service-account JSON, or any server FCM send path. A trusted backend must read tokens and send messages.

---

## State Management

Redux Toolkit slices:

| Slice     | Role                                                                 |
| --------- | -------------------------------------------------------------------- |
| `auth`    | User, status, form errors, `rememberedEmail`, authenticating flag    |
| `tasks`   | Hydrated task list / selection / load & save flags                   |
| `network` | Connectivity snapshot + monitoring flag                              |
| `sync`    | Syncing flag, pending/failed counts, last synced, sync error message |
| `theme`   | `light` \| `dark` \| `system`                                        |

**redux-persist** whitelists only:

- `auth.rememberedEmail`
- `theme.mode`

Passwords and full task collections are never persisted in AsyncStorage.

Typed hooks: `useAppDispatch` / `useAppSelector` (`src/store/hooks`).

---

## Navigation

`RootNavigator` gates on `auth.status`:

| Status          | Tree                             |
| --------------- | -------------------------------- |
| `unknown`       | `SplashScreen` (session restore) |
| `authenticated` | `AppNavigator` only              |
| otherwise       | `AuthNavigator` only             |

**Auth stack:** Login, Sign up (lazy-loaded).

**App stack:** Task list (eager), Task details / Create / Edit / Settings (lazy `React.lazy` + `Suspense`).

Conditional registration unmounts the inactive stack so auth and app flows stay isolated (React Navigation recommended pattern).

---

## Environment Configuration

Supported: **development**, **staging**, **production**.

Mechanism: [`react-native-config`](https://github.com/luggit/react-native-config) + `scripts/with-env.js`.

| Platform | Approach                                                                                |
| -------- | --------------------------------------------------------------------------------------- |
| Android  | Product flavors `development` / `staging` / `production` → `.env.*` via `dotenv.gradle` |
| iOS      | Schemes `tasksapp-development` / `tasksapp-staging` / `tasksapp-production` + `ENVFILE` |
| JS       | Typed `src/config/env.ts` (`getEnv`, `getFirebaseEnv`, `getAppConfig`)                  |

### Env files

| File                                                    | Git         | Purpose     |
| ------------------------------------------------------- | ----------- | ----------- |
| `.env.*.example`                                        | committed   | Templates   |
| `.env.development` / `.env.staging` / `.env.production` | **ignored** | Real values |

Variables (public Firebase web config only — never private keys):

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

### Run each environment

**Metro**

```sh
npm run start:development
npm run start:staging
npm run start:production
```

**iOS**

```sh
npm run ios:development
npm run ios:staging
npm run ios:production
```

**Android (debug)**

```sh
npm run android:development   # appId com.tasksapp.dev
npm run android:staging       # appId com.tasksapp.staging
npm run android:production    # appId com.tasksapp
```

**Android (release variants)**

```sh
npm run android:development:release
npm run android:staging:release
npm run android:production:release
```

Defaults (`npm start`, `npm run ios`, `npm run android`) use **development**.

---

## Installation

### Prerequisites

- Node matching `engines` (prefer `nvm use` with `.nvmrc` → `22.13.0`)
- Xcode + CocoaPods (iOS)
- Android Studio / SDK (Android)
- Ruby + Bundler (for CocoaPods via `Gemfile`)
- A Firebase project (Auth + Firestore enabled)

### Steps

```sh
# 1. Clone and install JS deps
cd tasksapp
nvm install && nvm use   # optional but recommended
npm install

# 2. Native iOS pods
bundle install
bundle exec pod install --project-directory=ios

# 3. Environment files
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
# Fill FIREBASE_* from Firebase Console → Project settings → Your apps

# 4. Native Google Services files (gitignored — see Firebase Setup)
#    android/app/google-services.json
#    ios/GoogleService-Info.plist

# 5. Deploy Firestore rules (once per project)
firebase deploy --only firestore:rules
```

---

## Firebase Setup

Configure exactly the following in [Firebase Console](https://console.firebase.google.com/):

1. **Create / select a project** (or separate projects per env if desired).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create database → deploy rules from this repo (`firestore.rules`).
4. **Register apps**
   - Android package IDs: `com.tasksapp.dev`, `com.tasksapp.staging`, `com.tasksapp` (as used by flavors).
   - iOS bundle IDs matching your Xcode targets/schemes.
5. Download and place:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/`
6. Copy the **public** web config fields into the matching `.env.*` files.
7. **(Bonus FCM)** Project settings → Cloud Messaging → enable; for iOS upload an **APNs** auth key/certificates; enable Push Notifications capability in Xcode.
8. **(Bonus FCM send)** Implement a server (Cloud Functions / Admin SDK) that reads `users/{uid}.fcmTokens` and sends via FCM HTTP v1. Never put the service account in the mobile app.

More detail: [`firebase/README.md`](./firebase/README.md).

---

## Android Setup

1. Place `android/app/google-services.json` (plugin applies only when the file exists).
2. Use the flavor-specific run scripts above (or Android Studio with the matching build variant).
3. Emulator/device should include Google Play services for Firebase/FCM.
4. Notification-related permissions are declared in the manifest (`POST_NOTIFICATIONS`, boot completed, vibrate, exact alarm). Grant notification permission when prompted on Android 13+.
5. After dependency changes, sync Gradle as usual (`npm run android:development`).

---

## iOS Setup

1. Place `ios/GoogleService-Info.plist`.
2. Install pods:

   ```sh
   bundle exec pod install --project-directory=ios
   ```

3. Open `ios/tasksapp.xcworkspace` (or use `npm run ios:development`).
4. Select scheme: `tasksapp-development` / `tasksapp-staging` / `tasksapp-production`.
5. For FCM: Signing & Capabilities → **Push Notifications**; Background Modes → Remote notifications (`Info.plist` includes `UIBackgroundModes` → `remote-notification`).
6. If CocoaPods hits static framework issues with RNFirebase, see notes in [`firebase/README.md`](./firebase/README.md) (`$RNFirebaseAsStaticFramework`, static linkage).

---

## Running the Application

```sh
# Terminal 1 — Metro (development)
npm run start:development

# Terminal 2 — device / simulator
npm run ios:development
# or
npm run android:development
```

Verify env wiring:

```sh
npm run env:check
```

---

## Testing

```sh
npm test
```

Focused unit coverage (Jest + in-memory fakes; **no real Firebase credentials**):

| Area                                    | Suite                             |
| --------------------------------------- | --------------------------------- |
| Auth repository + Redux transitions     | `__tests__/auth.test.ts`          |
| Task CRUD / offline retrieval           | `__tests__/tasks.test.ts`         |
| Sync push/pull, retries, LWW, dedupe    | `__tests__/syncManager.test.ts`   |
| Reminder schedule / cancel / reschedule | `__tests__/notifications.test.ts` |
| Error mapping                           | `__tests__/errors.test.ts`        |
| Validation / mappers / env / theme      | matching `__tests__/*` files      |

Shared fakes: `__tests__/helpers/memoryFakes.ts` (ignored as a suite via Jest config).

---

## Linting / Type Checking

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
```

---

## Performance Considerations

- **Task list:** `FlatList` with `getItemLayout`, tuned `windowSize` / `maxToRenderPerBatch` / `removeClippedSubviews`, and a memoized `TaskListItem` with a custom equality check.
- **Selectors / hooks:** List screens subscribe to list-oriented selectors; create/edit/details avoid over-subscribing to the full list where split hooks exist.
- **Lazy screens:** Task list is eager for first paint; details, create, edit, settings, and auth screens use `React.lazy`.
- **Network:** One NetInfo native subscription fanned out to many listeners.
- **Sync:** Single-flight flush prevents stacked parallel sync work.
- **Reminders:** Stable Notifee ids prevent duplicate schedules for the same task.

---

## Security Considerations

- **Environment variables:** Real `.env.*` and Google Services files are gitignored; only `*.example` templates are committed. JS reads public `FIREBASE_*` via `react-native-config`.
- **Firebase rules:** Owner-scoped paths; task writes require matching `id` / `userId`; default deny. Deploy with `firebase deploy --only firestore:rules`.
- **User-scoped data:** Thunks require `auth.user.uid`; SQLite queries filter `user_id`; Firestore paths use `users/{uid}/tasks/...`; client rejects mismatched `task.userId` on write.
- **No service accounts in the app:** FCM send and Admin SDK stay on a trusted server. The client only stores device tokens under the owner’s user document.
- **Persist whitelist:** Only non-secret preferences (`rememberedEmail`, theme mode).
- **User-facing errors:** SDK/database failures are mapped to curated messages; technical logs are `__DEV__`-gated and redact secret-looking meta keys.

---

## Known Limitations

Honest gaps and intentional cut lines:

1. **Online auto-flush:** Local mutations while already online refresh the pending count but do not always call `runSynchronization` immediately; sync runs on reconnect, pull-to-refresh, auth bootstrap, SyncManager start, or manual retry.
2. **Logout vs local DB:** Sign-out clears Redux and notifications, not SQLite / `sync_queue`. Data for a previous account can remain on device.
3. **`sync_queue` is not user-scoped** in schema (no `user_id` column); pending counts are global to the database file.
4. **Outbox coalescing:** Rapid edits can insert multiple queue rows per entity; push uses live task state, but queue size / attempt tracking can inflate.
5. **Mid-sync edit race:** `markSynchronized` clears sync status and queue rows by entity id without comparing a post-push newer local revision — a concurrent edit during an in-flight push can be mishandled.
6. **Dead-letter after 5 attempts:** Skipped entities are not auto-retried until attempts are reset (no dedicated recovery UI).
7. **FCM send** is not implemented in-app (by design).
8. **No production crash reporter** wired yet (`reportError` is silent when `!__DEV__`).
9. **Due date input** is a simple date string field (no native date picker).
10. **Soft-deleted** synced rows are kept locally as tombstones (not vacuumed).
11. Empty Firebase env values allow the app to boot in an unconfigured mode (auth/sync fail with mapped errors).

---

## Future Improvements

- Debounced auto-flush after local mutations when online
- Conditional `markSynchronized` (preserve dirtier local rows / newer outbox entries)
- Purge or partition SQLite + outbox on logout; add `user_id` to `sync_queue`
- Coalesce outbox operations per entity
- Crashlytics / Sentry in production `reportError`
- Dead-letter UI (retry / discard failed entities)
- Native date/time pickers for due / reminder
- CI pipeline (typecheck, lint, test, rules checks)
- Optional SQLCipher / encrypted local store for sensitive task content
- E2E (Detox/Maestro) for auth + offline sync happy paths

---

## Assignment Decisions / Trade-offs

| Decision                                     | Why                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **SQLite as local SoT, Redux as cache**      | Offline UX must not depend on network or a second full in-memory DB. Redux stays a projection for screens.       |
| **Ports + composition root**                 | Screens/features stay testable and Firebase-agnostic; adapters can be swapped or faked in Jest.                  |
| **Durable `sync_queue` + task `syncStatus`** | Survives process death; push can prefer live task rows while attempts live in the outbox.                        |
| **Push-before-pull + dirty-row protection**  | Offline edits remain authoritative until acknowledged; LWW applies only among synced peers.                      |
| **Single-flight SyncManager**                | Avoids overlapping push/pull races and duplicate remote writes.                                                  |
| **Notifee for local reminders**              | Reliable local triggers without a server; works offline.                                                         |
| **FCM client-only**                          | Token registration + display without shipping Admin credentials — correct security boundary for a mobile binary. |
| **Curated error messages**                   | Users never see raw Firebase/SQLite strings; `__DEV__` logs keep diagnostics useful.                             |
| **Multi-env flavors/schemes**                | Mirrors real product delivery (dev/staging/prod) without code forks.                                             |
| **Lazy secondary screens**                   | Faster first paint on the task list without bloating the initial bundle path.                                    |
| **In-memory fakes in tests**                 | Business logic coverage without brittle credentialed Firebase or a full native SQLite harness.                   |

These choices favor **correct offline UX, clear boundaries, and reviewable sync semantics** over premature infrastructure (encrypted DB, full E2E, in-app push sending).

---

## License

Private take-home assignment — not licensed for redistribution unless otherwise agreed.
