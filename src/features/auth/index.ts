export {useAuthStatus, useCurrentUser} from './hooks/useAuth';
export {LoginScreen} from './screens/LoginScreen';
export {SignUpScreen} from './screens/SignUpScreen';
export {createAuthFacade} from './services/authFacade';
export {
  authReducer,
  clearAuthError,
  resetAuthState,
  setAuthError,
  setAuthStatus,
  setAuthUser,
  setRememberedEmail,
} from './slice/authSlice';
export {
  hydrateAuthSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from './slice/authThunks';
export type {
  AuthCredentials,
  AuthService,
  AuthSession,
  AuthState,
  AuthUser,
  SignUpInput,
} from './types';
