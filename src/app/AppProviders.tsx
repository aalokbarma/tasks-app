import {useEffect, type PropsWithChildren} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {
  getAppDependencies,
  initializeLocalPersistence,
} from '@app/dependencies';
import {persistor, store} from '@store/index';
import {
  bootstrapAppState,
  teardownAppObservers,
} from '@store/bootstrap';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {selectThemeMode} from '@store/selectors';
import {ThemeProvider} from '@theme/ThemeProvider';

function PersistLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator />
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
        console.error('[database] Failed to initialize local SQLite.', error);
      }

      if (!cancelled) {
        await bootstrapAppState(dispatch);
      }
    };

    bootstrap().catch(error => {
      console.error('[app] Bootstrap failed.', error);
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

  return (
    <ThemeProvider themeMode={themeMode}>
      <AppBootstrap>{children}</AppBootstrap>
    </ThemeProvider>
  );
}

export function AppProviders({children}: PropsWithChildren) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <SafeAreaProvider>
          <ThemedTree>{children}</ThemedTree>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
