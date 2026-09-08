import {Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface HeaderTextButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * Stable header action used with React Navigation `headerLeft` / `headerRight`.
 */
export function HeaderTextButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
}: HeaderTextButtonProps) {
  const {theme} = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled}}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={styles.button}>
      <Text
        style={[
          styles.label,
          theme.typography.body,
          {color: theme.colors.primary},
          disabled ? styles.labelDisabled : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontWeight: '600',
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
