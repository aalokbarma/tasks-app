import {Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface HeaderTextButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Emphasize primary actions like Save in the header. */
  prominence?: 'default' | 'strong';
}

/**
 * Stable header action used with React Navigation `headerLeft` / `headerRight`.
 */
export function HeaderTextButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  prominence = 'default',
}: HeaderTextButtonProps) {
  const {theme} = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled}}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          minHeight: 44,
          justifyContent: 'center',
        },
      ]}>
      <Text
        style={[
          prominence === 'strong'
            ? theme.typography.bodyStrong
            : theme.typography.label,
          {color: theme.colors.primary},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
