import type {User} from '@react-native-firebase/auth';

import type {AuthUser} from '@features/auth/types';

export function mapFirebaseUserToAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export function mapFirebaseUserToAuthUserOrNull(
  user: User | null,
): AuthUser | null {
  return user ? mapFirebaseUserToAuthUser(user) : null;
}
