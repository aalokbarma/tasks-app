import type {UniqueId} from '@app-types/common';

/**
 * Generates a unique local id without relying on `crypto.getRandomValues`
 * (not available in React Native unless a native polyfill is linked).
 *
 * Good enough for offline task / queue ids; not a cryptographic UUID.
 */
export function createId(): UniqueId {
  const time = Date.now().toString(36);
  const random = `${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`.slice(0, 16);
  return `${time}-${random}`;
}
