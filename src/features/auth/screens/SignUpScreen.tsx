import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Button} from '@components/ui/Button';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {PasswordField, TextField} from '@components/ui/TextField';
import {AuthFormLayout} from '@features/auth/components/AuthFormLayout';
import {useAuthController} from '@features/auth/hooks/useAuthController';
import {
  validateSignUpForm,
  type SignUpFormErrors,
} from '@features/auth/utils/validateAuthForm';
import type {AuthNavigationProp} from '@navigation/types';
import {signUpWithEmail} from '@features/auth/slice/authThunks';

export function SignUpScreen() {
  const navigation = useNavigation<AuthNavigationProp<'Signup'>>();
  const {isAuthenticating, errorMessage, clearError, signUp} =
    useAuthController();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignUpFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = isAuthenticating || isSubmitting;

  const clearFieldError = (field: keyof SignUpFormErrors) => {
    setFieldErrors(current => {
      if (!current[field]) {
        return current;
      }

      return {...current, [field]: undefined};
    });
  };

  const handleSubmit = async () => {
    if (busy) {
      return;
    }

    const result = validateSignUpForm({
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (!result.valid) {
      setFieldErrors(result.errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const action = await signUp(result.values);
      if (signUpWithEmail.rejected.match(action)) {
        setPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="Save tasks offline and sync when you're back online."
      footerPrompt="Already have an account?"
      footerActionLabel="Sign in"
      footerDisabled={busy}
      onFooterPress={() => navigation.navigate('Login')}>
      <FormErrorBanner
        message={errorMessage}
        accessibilityLabel="Sign up error"
      />

      <TextField
        label="Name (optional)"
        value={displayName}
        onChangeText={value => {
          setDisplayName(value);
          clearFieldError('displayName');
          if (errorMessage) {
            clearError();
          }
        }}
        error={fieldErrors.displayName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        editable={!busy}
        accessibilityLabel="Display name"
      />

      <TextField
        label="Email"
        value={email}
        onChangeText={value => {
          setEmail(value);
          clearFieldError('email');
          if (errorMessage) {
            clearError();
          }
        }}
        error={fieldErrors.email}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!busy}
        accessibilityLabel="Email address"
      />

      <PasswordField
        label="Password"
        value={password}
        onChangeText={value => {
          setPassword(value);
          clearFieldError('password');
          if (errorMessage) {
            clearError();
          }
        }}
        error={fieldErrors.password}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        editable={!busy}
        accessibilityLabel="Password"
      />

      <PasswordField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={value => {
          setConfirmPassword(value);
          clearFieldError('confirmPassword');
          if (errorMessage) {
            clearError();
          }
        }}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!busy}
        accessibilityLabel="Confirm password"
      />

      <View style={styles.actions}>
        <Button
          label="Create account"
          onPress={handleSubmit}
          loading={busy}
          disabled={busy}
          accessibilityLabel="Create account"
        />
      </View>
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
  },
});
