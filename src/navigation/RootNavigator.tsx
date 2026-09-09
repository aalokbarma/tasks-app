import {NavigationContainer} from '@react-navigation/native';
import {useMemo} from 'react';

import {selectAuthStatus} from '@store/selectors';
import {useAppSelector} from '@store/hooks';
import {useTheme} from '@theme/ThemeProvider';

import {AppNavigator} from './AppNavigator';
import {AuthNavigator} from './AuthNavigator';
import {createNavigationTheme} from './navigationTheme';
import {SplashScreen} from './SplashScreen';

/**
 * Top-level switcher gated by Redux auth status.
 *
 * Renders exactly one tree at a time (Splash | App | Auth) — not as screens
 * inside another native stack. Nesting native stacks under Fabric on Android
 * has caused ScreenStack `Index out of bounds` / `addViewAt` crashes.
 */
export function RootNavigator() {
  const authStatus = useAppSelector(selectAuthStatus);
  const {theme} = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  const isRestoringSession = authStatus === 'unknown';
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <NavigationContainer theme={navigationTheme}>
      {isRestoringSession ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
