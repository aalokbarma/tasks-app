import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';

import {useConnectivityPresentation} from '@features/network/hooks/useConnectivityPresentation';
import {clearSyncFailure} from '@features/sync/slice/syncSlice';
import {runSynchronization} from '@features/sync/slice/syncThunks';
import {useAppDispatch} from '@store/hooks';
import {useTheme} from '@theme/ThemeProvider';

/**
 * Subtle status strip for offline-first UX.
 * Never blocks CRUD; never alerts for normal offline use.
 */
export function ConnectivityStatusBar() {
  const presentation = useConnectivityPresentation();
  const {theme} = useTheme();
  const dispatch = useAppDispatch();

  if (presentation.kind === 'hidden') {
    return null;
  }

  const palette = resolvePalette(presentation.kind, theme.mode);

  const onPress = () => {
    if (presentation.kind === 'failed' || presentation.kind === 'pending') {
      dispatch(clearSyncFailure());
      dispatch(runSynchronization());
    }
  };

  const content = (
    <View
      accessibilityRole="text"
      accessibilityLabel={presentation.message}
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: palette.background,
          borderBottomColor: palette.border,
        },
      ]}>
      <View style={styles.row}>
        {presentation.kind === 'syncing' ? (
          <ActivityIndicator
            size="small"
            color={palette.text}
            style={styles.spinner}
          />
        ) : (
          <View style={[styles.dot, {backgroundColor: palette.dot}]} />
        )}
        <Text
          numberOfLines={2}
          style={[
            styles.text,
            theme.typography.caption,
            {color: palette.text},
          ]}>
          {presentation.message}
        </Text>
        {presentation.canRetry ? (
          <Text
            style={[
              styles.action,
              theme.typography.caption,
              {color: palette.text},
            ]}>
            Retry
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (presentation.canRetry) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${presentation.message}. Double tap to retry sync.`}
        onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

/** @deprecated Prefer ConnectivityStatusBar — kept for import compatibility. */
export const OfflineBanner = ConnectivityStatusBar;

function resolvePalette(
  kind: 'offline' | 'syncing' | 'pending' | 'failed',
  mode: 'light' | 'dark',
): {background: string; border: string; text: string; dot: string} {
  const dark = mode === 'dark';

  switch (kind) {
    case 'offline':
      return {
        background: dark ? 'rgba(168,162,158,0.12)' : '#F5F5F4',
        border: dark ? '#44403C' : '#E7E5E4',
        text: dark ? '#D6D3D1' : '#57534E',
        dot: dark ? '#A8A29E' : '#78716C',
      };
    case 'syncing':
      return {
        background: dark ? 'rgba(45,212,191,0.12)' : '#F0FDFA',
        border: dark ? '#115E59' : '#99F6E4',
        text: dark ? '#5EEAD4' : '#0F766E',
        dot: dark ? '#2DD4BF' : '#0F766E',
      };
    case 'pending':
      return {
        background: dark ? 'rgba(45,212,191,0.08)' : '#F8FAFC',
        border: dark ? '#334155' : '#E2E8F0',
        text: dark ? '#94A3B8' : '#64748B',
        dot: dark ? '#2DD4BF' : '#0F766E',
      };
    case 'failed':
      return {
        background: dark ? 'rgba(251,146,60,0.14)' : '#FFF7ED',
        border: dark ? '#9A3412' : '#FED7AA',
        text: dark ? '#FB923C' : '#C2410C',
        dot: dark ? '#FB923C' : '#EA580C',
      };
  }
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    transform: [{scale: 0.85}],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    flexShrink: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  action: {
    fontWeight: '700',
  },
});
