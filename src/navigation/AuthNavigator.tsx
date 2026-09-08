import {lazy, Suspense} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useTheme} from '@theme/ThemeProvider';

import {LazyScreenFallback} from './LazyScreenFallback';
import {createDefaultStackOptions} from './screenOptions';
import type {AuthNavigatorParamList} from './types';

const LoginScreen = lazy(() =>
  import('@features/auth/screens/LoginScreen').then(module => ({
    default: module.LoginScreen,
  })),
);

const SignUpScreen = lazy(() =>
  import('@features/auth/screens/SignUpScreen').then(module => ({
    default: module.SignUpScreen,
  })),
);

const Stack = createNativeStackNavigator<AuthNavigatorParamList>();

/**
 * Unauthenticated flow. Unmounted entirely when the user is signed in,
 * so authenticated users cannot remain on Login/Signup.
 */
export function AuthNavigator() {
  const {theme} = useTheme();
  const screenOptions = createDefaultStackOptions(theme);

  return (
    <Suspense fallback={<LazyScreenFallback />}>
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
    </Suspense>
  );
}
