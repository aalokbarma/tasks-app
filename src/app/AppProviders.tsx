import {useEffect, type PropsWithChildren} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {
  getAppDependencies,
  initializeLocalPersistence,
} from '@app/dependencies';
import {persistor, store} from '@store/index';
import {bootstrapAppState, teardownAppObservers} from '@store/bootstrap';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {selectThemeMode} from '@store/selectors';
import {ThemeProvider, useTheme} from '@theme/ThemeProvider';
import {AppToast} from '@components/ui/toast';
import {reportError} from '@utils/errors';

function PersistLoading() {
  const {theme} = useTheme();

  return (
    <View style={[styles.loading, {backgroundColor: theme.colors.background}]}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

function AppBootstrap({children}: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    getAppDependencies();

    const bootstrap = async () => {
      try {
        await initializeLocalPersistence();
      } catch (error) {
        reportError('database', error);
      }

      if (!cancelled) {
        await bootstrapAppState(dispatch);
      }
    };

    bootstrap().catch(error => {
      reportError('app', error);
    });

    return () => {
      cancelled = true;
      teardownAppObservers();
    };
  }, [dispatch]);

  return children;
}

function ThemedTree({children}: PropsWithChildren) {
  const themeMode = useAppSelector(selectThemeMode);

  return <ThemeProvider themeMode={themeMode}>{children}</ThemeProvider>;
}

export function AppProviders({children}: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemedTree>
            <PersistGate loading={<PersistLoading />} persistor={persistor}>
              <AppBootstrap>
                <AppToast>{children}</AppToast>
              </AppBootstrap>
            </PersistGate>
          </ThemedTree>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
