import type {AuthStatus, ISODateString, UniqueId} from '@app-types/common';

export interface AuthUser {
  uid: UniqueId;
  email: string | null;
  displayName: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  status: AuthStatus;
  user: AuthUser | null;
  errorMessage: string | null;
}

export interface SignUpInput extends AuthCredentials {
  displayName?: string;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  errorMessage: string | null;
  /** Non-secret preference persisted for login form convenience. */
  rememberedEmail: string | null;
  isAuthenticating: boolean;
  lastSyncedAt: ISODateString | null;
}
