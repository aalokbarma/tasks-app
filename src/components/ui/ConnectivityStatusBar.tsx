import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';

import {useConnectivityPresentation} from '@features/network/hooks/useConnectivityPresentation';
import {clearSyncFailure} from '@features/sync/slice/syncSlice';
import {runSynchronization} from '@features/sync/slice/syncThunks';
import {useAppDispatch} from '@store/hooks';
import type {AppTheme} from '@theme/createTheme';
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

  const palette = resolveStatusPalette(presentation.kind, theme);

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
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
      ]}>
      <View style={[styles.row, {gap: theme.spacing.sm}]}>
        {presentation.kind === 'syncing' ? (
          <ActivityIndicator
            size="small"
            color={palette.text}
            style={styles.spinner}
          />
        ) : (
          <View
            style={[
              styles.dot,
              {
                backgroundColor: palette.dot,
                borderRadius: theme.radii.full,
              },
            ]}
          />
        )}
        <Text
          numberOfLines={2}
          style={[
            theme.typography.caption,
            {color: palette.text, flexShrink: 1, textAlign: 'center', fontWeight: '500'},
          ]}>
          {presentation.message}
        </Text>
        {presentation.canRetry ? (
          <Text
            style={[
              theme.typography.caption,
              {color: palette.text, fontWeight: '700'},
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

function resolveStatusPalette(
  kind: 'offline' | 'syncing' | 'pending' | 'failed',
  theme: AppTheme,
): {background: string; border: string; text: string; dot: string} {
  const {colors} = theme;

  switch (kind) {
    case 'offline':
      return {
        background: colors.statusOfflineBackground,
        border: colors.statusOfflineBorder,
        text: colors.statusOfflineText,
        dot: colors.statusOfflineDot,
      };
    case 'syncing':
      return {
        background: colors.statusInfoBackground,
        border: colors.statusInfoBorder,
        text: colors.statusInfoText,
        dot: colors.statusInfoDot,
      };
    case 'pending':
      return {
        background: colors.statusPendingBackground,
        border: colors.statusPendingBorder,
        text: colors.statusPendingText,
        dot: colors.statusPendingDot,
      };
    case 'failed':
      return {
        background: colors.statusWarningBackground,
        border: colors.statusWarningBorder,
        text: colors.statusWarningText,
        dot: colors.statusWarningDot,
      };
  }
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    transform: [{scale: 0.85}],
  },
  dot: {
    width: 6,
    height: 6,
  },
});
