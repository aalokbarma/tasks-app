/**
 * Curated copy shown in the UI. Never include SDK / stack details here.
 * Keys align with FirebaseErrorCode / DatabaseErrorCode.
 */
export const FIREBASE_USER_MESSAGES: Record<string, string> = {
  unconfigured:
    'Cloud services are not set up on this build. You can still use tasks offline.',
  unavailable:
    'Cloud services are temporarily unavailable. Your changes are saved on this device.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters).',
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network problem. Check your connection and try again.',
  'auth/operation-not-allowed':
    'Email sign-in is not enabled for this project.',
  'auth/unknown': 'Sign-in failed. Please try again.',
  'firestore/permission-denied':
    'You do not have permission to sync this data.',
  'firestore/not-found': 'That item could not be found in the cloud.',
  'firestore/unavailable':
    'Cloud sync is temporarily unavailable. Changes stay on this device.',
  'firestore/unknown':
    'Cloud sync failed. Your changes are saved on this device.',
  'messaging/permission-denied':
    'Notifications are off. Enable them in system settings for reminders.',
  'messaging/unavailable':
    'Push notifications are unavailable on this device right now.',
  'messaging/unknown': 'Could not set up push notifications.',
  unknown: 'Something went wrong. Please try again.',
};

export const DATABASE_USER_MESSAGES: Record<string, string> = {
  open: 'Could not open local storage. Restart the app and try again.',
  query: 'Could not read local tasks. Restart the app and try again.',
  write: 'Could not save to this device. Please try again.',
  migrate: 'Local storage update failed. Restart the app and try again.',
  corrupt: 'Some local data looked invalid and was skipped.',
  unknown: 'A local storage error occurred. Please try again.',
};
