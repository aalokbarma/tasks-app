import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  SignUpInput,
} from '../types/auth.types';

/**
 * Feature-facing authentication port.
 * Screens and thunks depend on this — never on Firebase SDKs.
 */
export interface AuthRepository {
  getCurrentSession(): Promise<AuthSession>;
  signIn(credentials: AuthCredentials): Promise<AuthUser>;
  signUp(input: SignUpInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  subscribe(listener: (session: AuthSession) => void): () => void;
}
