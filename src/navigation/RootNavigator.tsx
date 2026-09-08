import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useMemo} from 'react';

import {selectAuthStatus} from '@store/selectors';
import {useAppSelector} from '@store/hooks';
import {useTheme} from '@theme/ThemeProvider';

import {AppNavigator} from './AppNavigator';
import {AuthNavigator} from './AuthNavigator';
import {createNavigationTheme} from './navigationTheme';
import {SplashScreen} from './SplashScreen';
import type {RootNavigatorParamList} from './types';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

/**
 * Top-level navigator gated by Redux auth status.
 *
 * - `unknown`        → Splash (session restore)
 * - `authenticated`  → AppNavigator only
 * - otherwise        → AuthNavigator only
 *
 * Conditional screen registration unmounts the inactive tree, which is the
 * React Navigation-recommended way to keep auth and app flows isolated.
 */
export function RootNavigator() {
  const authStatus = useAppSelector(selectAuthStatus);
  const {theme} = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  const isRestoringSession = authStatus === 'unknown';
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        {isRestoringSession ? (
          <RootStack.Screen
            name="Splash"
            component={SplashScreen}
            options={{animation: 'none'}}
          />
        ) : isAuthenticated ? (
          <RootStack.Screen
            name="App"
            component={AppNavigator}
            options={{animationTypeForReplace: 'push'}}
          />
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{animationTypeForReplace: 'pop'}}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
