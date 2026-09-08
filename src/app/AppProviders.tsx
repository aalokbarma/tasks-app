import {useEffect, type PropsWithChildren} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {getAppDependencies} from '@app/dependencies';
import {setAuthStatus} from '@features/auth/slice/authSlice';
import {store} from '@store/index';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {ThemeProvider} from '@theme/ThemeProvider';

function AuthBootstrap({children}: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize Firebase infrastructure once. Auth session hydration lands with auth UI.
    getAppDependencies();
    dispatch(setAuthStatus('unauthenticated'));
  }, [dispatch]);

  return children;
}

function ThemedTree({children}: PropsWithChildren) {
  const themeMode = useAppSelector(state => state.theme.mode);

  return (
    <ThemeProvider themeMode={themeMode}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </ThemeProvider>
  );
}

export function AppProviders({children}: PropsWithChildren) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemedTree>{children}</ThemedTree>
      </SafeAreaProvider>
    </Provider>
  );
}
