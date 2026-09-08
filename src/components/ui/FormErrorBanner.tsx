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
        theme.mode === 'dark' ? styles.bannerDark : styles.bannerLight,
        {borderColor: theme.colors.danger},
      ]}>
      <Text
        style={[
          styles.message,
          theme.typography.caption,
          {color: theme.colors.danger},
        ]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerLight: {
    backgroundColor: '#FEF2F2',
  },
  bannerDark: {
    backgroundColor: 'rgba(248,113,113,0.16)',
  },
  message: {
    fontWeight: '500',
  },
});
