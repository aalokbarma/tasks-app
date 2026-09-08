import type {AuthService} from '@features/auth/types';
import {notImplemented} from '@utils/notImplemented';

export function createFirebaseAuthService(): AuthService {
  return {
    getCurrentSession: () => notImplemented('FirebaseAuthService.getCurrentSession'),
    signIn: () => notImplemented('FirebaseAuthService.signIn'),
    signUp: () => notImplemented('FirebaseAuthService.signUp'),
    signOut: () => notImplemented('FirebaseAuthService.signOut'),
    subscribe: () => notImplemented('FirebaseAuthService.subscribe'),
  };
}
