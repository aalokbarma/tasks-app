import {useEffect, useRef} from 'react';
import {AccessibilityInfo, Animated, StyleSheet, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '@theme/ThemeProvider';

import type {ToastState} from './ToastContext';

interface ToastHostProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

/**
 * Bottom snackbar host. Renders above navigation content via absolute overlay.
 */
export function ToastHost({toast, onDismiss}: ToastHostProps) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!toast) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(12);

    AccessibilityInfo.announceForAccessibility(toast.message);

    const show = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]);

    const hide = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 8,
        duration: 160,
        useNativeDriver: true,
      }),
    ]);

    let dismissed = false;
    const timeout = setTimeout(() => {
      hide.start(({finished}) => {
        if (finished && !dismissed) {
          onDismiss();
        }
      });
    }, toast.durationMs);

    show.start();

    return () => {
      dismissed = true;
      clearTimeout(timeout);
    };
  }, [toast, opacity, translateY, onDismiss]);

  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.host,
        {
          bottom: Math.max(insets.bottom, theme.spacing.md) + theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          opacity,
          transform: [{translateY}],
        },
      ]}>
      <Animated.View
        style={[
          styles.snackbar,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 2,
            ...theme.shadows.md,
          },
        ]}>
        <Text
          style={[
            theme.typography.bodyStrong,
            {color: theme.colors.textPrimary},
          ]}>
          {toast.message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  snackbar: {
    alignSelf: 'center',
    maxWidth: 420,
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
