import {useMemo, useState, type ReactNode} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  accessibilityLabel?: string;
  rightAccessory?: ReactNode;
  containerStyle?: object;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  accessibilityLabel,
  rightAccessory,
  containerStyle,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const {theme} = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
          },
        ]}>
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={event => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          style={[
            styles.input,
            theme.typography.body,
            {
              color: theme.colors.textPrimary,
            },
            !editable && styles.inputDisabled,
          ]}
        />
        {rightAccessory}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.error,
            theme.typography.caption,
            {color: theme.colors.danger},
          ]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export interface PasswordFieldProps
  extends Omit<TextFieldProps, 'secureTextEntry' | 'rightAccessory'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export function PasswordField({
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  ...props
}: PasswordFieldProps) {
  const {theme} = useTheme();
  const [visible, setVisible] = useState(false);

  const toggleLabel = useMemo(
    () => (visible ? hidePasswordLabel : showPasswordLabel),
    [hidePasswordLabel, showPasswordLabel, visible],
  );

  return (
    <TextField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toggleLabel}
          hitSlop={8}
          onPress={() => setVisible(current => !current)}
          style={styles.toggle}>
          <Text
            style={[
              styles.toggleLabel,
              theme.typography.caption,
              {color: theme.colors.primary},
            ]}>
            {visible ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  error: {
    marginTop: 6,
  },
  toggle: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  toggleLabel: {
    fontWeight: '600',
  },
});
