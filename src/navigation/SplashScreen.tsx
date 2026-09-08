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
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
      <Text
        style={[
          theme.typography.overline,
          {
            color: theme.colors.primary,
            textTransform: 'uppercase',
          },
        ]}>
        TasksApp
      </Text>
      <ActivityIndicator
        color={theme.colors.primary}
        accessibilityLabel="Loading"
      />
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.textSecondary, textAlign: 'center'},
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
  },
});
