import {useMemo, useState, type ReactNode} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  hint?: string | null;
  accessibilityLabel?: string;
  rightAccessory?: ReactNode;
  containerStyle?: object;
  inputStyle?: StyleProp<TextStyle>;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  accessibilityLabel,
  rightAccessory,
  containerStyle,
  inputStyle,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const {theme} = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.focusRing
      : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          theme.typography.label,
          {
            color: error
              ? theme.colors.danger
              : focused
                ? theme.colors.textPrimary
                : theme.colors.textSecondary,
            marginBottom: theme.spacing.xs + 2,
          },
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputRow,
          inputProps.multiline && styles.inputRowMultiline,
          {
            backgroundColor: editable
              ? theme.colors.surface
              : theme.colors.surfaceMuted,
            borderColor,
            borderRadius: theme.radii.md,
            borderWidth: focused || error ? 1.5 : 1,
          },
        ]}>
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={theme.colors.textTertiary}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{disabled: !editable}}
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
            {color: theme.colors.textPrimary},
            !editable && styles.inputDisabled,
            inputStyle,
          ]}
        />
        {rightAccessory}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.caption,
            {
              color: theme.colors.danger,
              marginTop: theme.spacing.xs + 2,
              fontWeight: '500',
            },
          ]}>
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            theme.typography.caption,
            {
              color: theme.colors.textTertiary,
              marginTop: theme.spacing.xs + 2,
            },
          ]}>
          {hint}
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
      textContentType={props.textContentType ?? 'password'}
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toggleLabel}
          hitSlop={10}
          onPress={() => setVisible(current => !current)}
          style={styles.toggle}>
          <Text
            style={[
              theme.typography.label,
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
  inputRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 4,
    minHeight: 110,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  toggle: {
    marginLeft: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
