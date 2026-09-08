import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

/**
 * Shown while Firebase auth session is being restored (`auth.status === 'unknown'`).
 */
export function SplashScreen() {
  const {theme} = useTheme();

  return (
    <View
      accessibilityLabel="Restoring your session"
      accessibilityRole="progressbar"
      style={[styles.root, {backgroundColor: theme.colors.background}]}>
      <Text
        style={[
          styles.brand,
          theme.typography.caption,
          {color: theme.colors.primary},
        ]}>
        TasksApp
      </Text>
      <ActivityIndicator
        color={theme.colors.primary}
        accessibilityLabel="Loading"
      />
      <Text
        style={[
          styles.caption,
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        Restoring your session…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  brand: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  caption: {
    textAlign: 'center',
  },
});
