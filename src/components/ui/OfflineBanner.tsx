import {StyleSheet, Text, View} from 'react-native';

import {useIsOnline} from '@features/network/hooks/useNetwork';
import {useTheme} from '@theme/ThemeProvider';

export function OfflineBanner() {
  const isOnline = useIsOnline();
  const {theme} = useTheme();

  if (isOnline) {
    return null;
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="You are offline. Changes are saved on this device."
      style={[
        styles.banner,
        theme.mode === 'dark' ? styles.bannerDark : styles.bannerLight,
        {borderBottomColor: theme.colors.warning},
      ]}>
      <Text
        style={[
          styles.text,
          theme.typography.caption,
          {color: theme.colors.warning},
        ]}>
        Offline — changes save on this device and will sync later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerLight: {
    backgroundColor: '#FFF7ED',
  },
  bannerDark: {
    backgroundColor: 'rgba(251,146,60,0.18)',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
