import {
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticating,
  selectRememberedEmail,
} from '@store/selectors';
import {useAppSelector} from '@store/hooks';

export function useAuthStatus() {
  return useAppSelector(selectAuthStatus);
}

export function useCurrentUser() {
  return useAppSelector(selectCurrentUser);
}

export function useRememberedEmail() {
  return useAppSelector(selectRememberedEmail);
}

export function useIsAuthenticating() {
  return useAppSelector(selectIsAuthenticating);
}

export function useAuthError() {
  return useAppSelector(selectAuthError);
}
