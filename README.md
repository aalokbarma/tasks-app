# TasksApp

Cross-platform task management app (React Native CLI + TypeScript) for a team-lead take-home assignment.

## Current status

Scaffold, multi-env config, Firebase adapters, SQLite offline persistence, Redux Toolkit, and **email/password authentication** (login, signup, logout, session restore) are in place. Task UI, Firestore sync engine, and notifications are still upcoming.

## Architecture

```
UI (screens/components)
  → hooks
  → Redux / use cases
  → repositories & service interfaces
  → SQLite (local) / Firebase (remote adapters)
```

- **SQLite** is the offline source of truth for tasks; Redux holds a hydrated UI cache only (not a second full DB).
- **Auth** uses an `AuthRepository` port (Firebase adapter underneath). Screens never import Firebase. Session restore shows a splash; `onAuthStateChanged` keeps Redux in sync. Logout clears user-scoped Redux state (tasks/sync).
- **Redux slices**: `auth`, `tasks`, `network`, `theme`, `sync` — typed `RootState` / `AppDispatch` / `useAppDispatch` / `useAppSelector`.
- **redux-persist** whitelists only lightweight prefs (`auth.rememberedEmail`, `theme.mode`); task lists are not persisted in Redux.
- **Firestore** is reached only through remote data-source adapters under `services/firebase` — never from the tasks feature UI module.
- **Auth / App stacks** are selected from Redux auth status.
- Screens are **lazy-loaded** via `React.lazy` + `Suspense`.
- **Firebase config** is loaded exclusively from environment variables via `react-native-config`.
- Task queries are always scoped by the signed-in `userId`.

## Folder structure

```
src/
  app/            # App entry, providers, dependency composition
  components/     # Shared UI / layout
  config/         # Env + constants (typed getAppConfig / getEnv)
  database/       # SQLite client, schema, repository adapters
  features/       # auth, tasks, sync, notifications, settings
  hooks/          # Shared typed Redux hooks
  navigation/     # AuthStack, AppStack, RootNavigator
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
