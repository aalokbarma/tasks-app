import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  SignUpInput,
} from './auth.types';

/**
 * Feature-facing auth contract. Infrastructure adapters live under services/.
 */
export interface AuthService {
  getCurrentSession(): Promise<AuthSession>;
  signIn(credentials: AuthCredentials): Promise<AuthUser>;
  signUp(input: SignUpInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  subscribe(listener: (session: AuthSession) => void): () => void;
}
