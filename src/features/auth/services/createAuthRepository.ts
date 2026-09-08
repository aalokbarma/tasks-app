import {
  normalizeEmail,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from '@utils/validation';

import type {AuthService} from '../types/auth.service';
import type {AuthCredentials, SignUpInput} from '../types/auth.types';
import type {AuthRepository} from '../repositories/AuthRepository';

function assertValidCredentials(credentials: AuthCredentials): void {
  const emailResult = validateEmail(credentials.email);
  if (!emailResult.valid) {
    throw new Error(emailResult.message ?? 'Invalid email.');
  }

  const passwordResult = validatePassword(credentials.password);
  if (!passwordResult.valid) {
    throw new Error(passwordResult.message ?? 'Invalid password.');
  }
}

function normalizeCredentials(
  credentials: AuthCredentials,
): AuthCredentials {
  return {
    email: normalizeEmail(credentials.email),
    password: credentials.password,
  };
}

/**
 * Auth repository that validates/normalizes input before delegating
 * to the infrastructure AuthService (Firebase adapter).
 */
export function createAuthRepository(
  authService: AuthService,
): AuthRepository {
  return {
    getCurrentSession() {
      return authService.getCurrentSession();
    },

    async signIn(credentials) {
      assertValidCredentials(credentials);
      return authService.signIn(normalizeCredentials(credentials));
    },

    async signUp(input: SignUpInput) {
      assertValidCredentials(input);

      const nameResult = validateDisplayName(input.displayName ?? '');
      if (!nameResult.valid) {
        throw new Error(nameResult.message ?? 'Invalid name.');
      }

      const normalized = normalizeCredentials(input);
      return authService.signUp({
        ...normalized,
        displayName: input.displayName?.trim() || undefined,
      });
    },

    signOut() {
      return authService.signOut();
    },

    subscribe(listener) {
      return authService.subscribe(listener);
    },
  };
}
