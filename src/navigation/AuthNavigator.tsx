import {useMemo} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {LoginScreen} from '@features/auth/screens/LoginScreen';
import {SignUpScreen} from '@features/auth/screens/SignUpScreen';
import {useTheme} from '@theme/ThemeProvider';

import {createDefaultStackOptions} from './screenOptions';
import type {AuthNavigatorParamList} from './types';

const Stack = createStackNavigator<AuthNavigatorParamList>();

/**
 * Unauthenticated flow. Unmounted entirely when the user is signed in.
 *
 * JS stack — same Fabric / ScreenStack rationale as AppNavigator.
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
      detachInactiveScreens={false}
      screenOptions={{
        ...screenOptions,
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign in',
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
