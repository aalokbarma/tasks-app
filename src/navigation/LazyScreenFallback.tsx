import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

/**
 * Shared Suspense fallback for lazily loaded screens.
 */
export function LazyScreenFallback() {
  const {theme} = useTheme();

  return (
    <View
      accessibilityLabel="Loading screen"
      accessibilityRole="progressbar"
      style={[styles.fallback, {backgroundColor: theme.colors.background}]}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
