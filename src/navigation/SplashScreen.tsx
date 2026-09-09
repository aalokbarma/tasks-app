import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

const appLogo = require('../../assets/branding/app-logo.png');

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
      <Image
        source={appLogo}
        style={styles.logo}
        accessibilityIgnoresInvertColors
        accessibilityLabel="Tasks App logo"
      />
      <Text
        style={[
          theme.typography.title,
          {
            color: theme.colors.textPrimary,
            textAlign: 'center',
          },
        ]}>
        Tasks App
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
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
});
