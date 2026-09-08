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

## Architecture

Feature modules depend on interfaces only:

- `AuthService` ← `createFirebaseAuthService()`
- `TaskRemoteDataSource` / `FirestoreService` ← Firestore adapters
- `PushNotificationService` ← `createFirebaseMessagingService()`

Composition root: `src/app/dependencies.ts` via `getAppDependencies()`.

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
