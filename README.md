# TasksApp

Cross-platform task management app (React Native CLI + TypeScript) for a team-lead take-home assignment.

## Current status

Scaffold only: feature-based architecture, typed contracts, Redux store, navigation shells, and environment templates. Business features (Firebase Auth, SQLite, sync, notifications) are intentionally not implemented yet.

## Architecture

```
UI (screens/components)
  → hooks
  → Redux / use cases
  → repositories & service interfaces
  → SQLite (local) / Firebase (remote adapters)
```

- **SQLite** is the offline source of truth (to be wired next).
- **Firestore** is reached only through remote data-source adapters under `services/firebase` — never from the tasks feature UI module.
- **Auth / App stacks** are selected from Redux auth status.
- Screens are **lazy-loaded** via `React.lazy` + `Suspense`.

## Folder structure

```
src/
  app/            # App entry, providers, dependency composition
  components/     # Shared UI / layout
  config/         # Env + constants
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

## Environment setup

1. Copy env templates (do not commit real values):

```sh
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

2. Fill public Firebase web config keys when ready. Native config files belong under `android/app/` and `ios/` — see `firebase/README.md`.

3. `.env*` files (except `*.example`) and `google-services.json` / `GoogleService-Info.plist` are gitignored.

## Scripts

```sh
npm start          # Metro
npm run ios        # iOS
npm run android    # Android
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm test           # Jest
```

## Libraries (installed for scaffold)

| Area | Packages |
|------|----------|
| Navigation | `@react-navigation/native`, `native-stack`, `screens`, `gesture-handler`, `safe-area-context` |
| State | `@reduxjs/toolkit`, `react-redux` |
| Config | `react-native-config` |
| IDs | `uuid` |

Deferred installs (next phases): `@react-native-firebase/*`, `react-native-nitro-sqlite`, `@notifee/react-native`, `@react-native-community/netinfo`.

## Limitations (scaffold)

- No Firebase, SQLite, sync, or notification behavior yet.
- Auth bootstraps to `unauthenticated` so navigation is exercisable.
- Infrastructure factories throw `NotImplementedError` until implemented.
- Native linking for `react-native-config` / gesture-handler / screens still required before device builds of those features.

## Run instructions

Follow the React Native environment guide, then:

```sh
npm install
bundle install
bundle exec pod install --project-directory=ios
npm start
npm run ios   # or npm run android
```
