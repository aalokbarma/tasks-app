import type {AuthService} from '../types';

/**
 * Thin composition helper. Business logic will wrap the injected AuthService.
 */
export function createAuthFacade(authService: AuthService): AuthService {
  return authService;
}
