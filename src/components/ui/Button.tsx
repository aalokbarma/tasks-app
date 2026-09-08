import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const {theme} = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.surface
          : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.colors.textOnPrimary
      : variant === 'danger'
        ? theme.colors.textOnDanger
        : variant === 'ghost'
          ? theme.colors.primary
          : theme.colors.textPrimary;

  const borderColor =
    variant === 'secondary' ? theme.colors.border : 'transparent';

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: isDisabled, busy: loading}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderRadius: theme.radii.md,
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            theme.typography.button,
            {color: textColor, textAlign: 'center'},
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
