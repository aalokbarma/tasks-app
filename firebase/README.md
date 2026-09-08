# Firebase native configuration

Do **not** commit real Firebase credentials.

## Required native files (gitignored)

| Platform | Path |
|----------|------|
| Android | `android/app/google-services.json` |
| iOS | `ios/GoogleService-Info.plist` |

Also set matching public values in `.env.development` / `.env.staging` / `.env.production`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

JS code never hardcodes secrets. Native SDKs load credentials from the platform files above.
JS env vars are used to validate the expected project for the active environment.

## Architecture notes

Feature modules depend on interfaces only:

- `AuthService` ← `createFirebaseAuthService()`
- `TaskRemoteDataSource` / `FirestoreService` ← Firestore adapters
- `PushNotificationService` ← `createFirebaseMessagingService()`

Composition root: `src/app/dependencies.ts` via `getAppDependencies()`.

## Firestore security

Rules live at the repo root: [`firestore.rules`](../firestore.rules) (wired by [`firebase.json`](../firebase.json)).

Deploy:

```sh
firebase deploy --only firestore:rules
```

### Model

```
users/{userId}                 # owner profile / FCM token bag
users/{userId}/tasks/{taskId}  # that user's tasks only
```

### Rules summary

| Access | Condition |
|--------|-----------|
| Any path | Denied by default |
| `users/{userId}` | `request.auth.uid == userId` |
| `users/{userId}/tasks/{taskId}` | Authenticated owner only; create/update require `data.userId == userId` and `data.id == taskId` |

Never deploy `allow read, write: if true;`.

### Client scoping (defense in depth)

- Task thunks resolve `userId` from `state.auth.user.uid` and refuse unsigned calls.
- SQLite queries always include `user_id = ?`.
- Firestore SDK calls always use `users/{userId}/tasks/...` with that same uid.
- `FirestoreService.setTask` rejects writes when `task.userId !== userId`.
- SyncManager forces `userId` on upsert payloads before push.

### Credentials

The React Native app only uses **public** Firebase web config (`FIREBASE_*` in `.env`) plus native `google-services.json` / `GoogleService-Info.plist`.

**Do not** ship service-account JSON, Admin SDK keys, or private keys in the mobile app or this repository.

## iOS notes

After adding pods / Firebase packages:

```sh
bundle exec pod install --project-directory=ios
```

If CocoaPods fails with static framework issues, enable in `ios/Podfile`:

```ruby
$RNFirebaseAsStaticFramework = true
use_frameworks! :linkage => :static
```

## Android notes

`com.google.gms.google-services` is applied only when `android/app/google-services.json` exists.
