import {
  useAuthError,
  useAuthStatus,
  useCurrentUser,
  useIsAuthenticating,
  useRememberedEmail,
} from './useAuth';
import {useAppDispatch} from '@store/hooks';
import {clearAuthError, setRememberedEmail} from '../slice/authSlice';
import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../slice/authThunks';
import type {AuthCredentials, SignUpInput} from '../types';

/**
 * Feature hook that keeps auth business actions out of screen JSX.
 */
export function useAuthController() {
  const dispatch = useAppDispatch();
  const status = useAuthStatus();
  const user = useCurrentUser();
  const rememberedEmail = useRememberedEmail();
  const isAuthenticating = useIsAuthenticating();
  const errorMessage = useAuthError();

  return {
    status,
    user,
    rememberedEmail,
    isAuthenticating,
    errorMessage,
    clearError() {
      dispatch(clearAuthError());
    },
    rememberEmail(email: string | null) {
      dispatch(setRememberedEmail(email));
    },
    async signIn(credentials: AuthCredentials) {
      return dispatch(signInWithEmail(credentials));
    },
    async signUp(input: SignUpInput) {
      return dispatch(signUpWithEmail(input));
    },
    async signOut() {
      return dispatch(signOutUser());
    },
  };
}
