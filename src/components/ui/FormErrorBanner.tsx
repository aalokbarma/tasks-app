import {StyleSheet, Text, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface FormErrorBannerProps {
  message: string | null | undefined;
  accessibilityLabel?: string;
}

export function FormErrorBanner({
  message,
  accessibilityLabel = 'Authentication error',
}: FormErrorBannerProps) {
  const {theme} = useTheme();

  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.dangerMuted,
          borderColor: theme.colors.danger,
          borderRadius: theme.radii.md,
        },
      ]}>
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.danger, fontWeight: '500'},
        ]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
