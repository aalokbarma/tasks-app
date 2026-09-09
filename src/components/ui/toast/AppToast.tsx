import type {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';

import {ToastHost} from './ToastHost';
import {ToastProvider, useToastController} from './ToastContext';

/**
 * App-level toast overlay. Place inside ThemeProvider + SafeAreaProvider.
 */
export function AppToast({children}: PropsWithChildren) {
  const controller = useToastController();

  return (
    <ToastProvider value={controller}>
      <View style={styles.root}>
        {children}
        <ToastHost
          toast={controller.toast}
          onDismiss={controller.dismissToast}
        />
      </View>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
