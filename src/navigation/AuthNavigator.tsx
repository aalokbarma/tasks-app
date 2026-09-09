import {useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen} from '@features/auth/screens/LoginScreen';
import {SignUpScreen} from '@features/auth/screens/SignUpScreen';
import {useTheme} from '@theme/ThemeProvider';

import {createDefaultStackOptions} from './screenOptions';
import type {AuthNavigatorParamList} from './types';

const Stack = createNativeStackNavigator<AuthNavigatorParamList>();

/**
 * Unauthenticated flow. Unmounted entirely when the user is signed in,
 * so authenticated users cannot remain on Login/Signup.
 *
 * Screens are eager for the same Fabric / native-stack reason as AppNavigator.
 */
export function AuthNavigator() {
  const {theme} = useTheme();
  const screenOptions = useMemo(
    () => createDefaultStackOptions(theme),
    [theme],
  );

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        ...screenOptions,
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign in',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignUpScreen}
        options={{
          title: 'Create account',
          headerShown: true,
          headerTitle: 'Create account',
        }}
      />
    </Stack.Navigator>
  );
}
