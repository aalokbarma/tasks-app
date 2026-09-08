import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface LoadingStateProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Centered loading block used for initial/bootstrap screens.
 */
export function LoadingState({
  label = 'Loading…',
  style,
  accessibilityLabel,
}: LoadingStateProps) {
  const {theme} = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.root,
        {gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl},
        style,
      ]}>
      <ActivityIndicator color={theme.colors.primary} size="small" />
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.textSecondary, textAlign: 'center'},
        ]}>
        {label}
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
