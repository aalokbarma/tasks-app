import {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Button} from '@components/ui/Button';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {PasswordField, TextField} from '@components/ui/TextField';
import {AuthFormLayout} from '@features/auth/components/AuthFormLayout';
import {useAuthController} from '@features/auth/hooks/useAuthController';
import {
  validateLoginForm,
  type LoginFormErrors,
} from '@features/auth/utils/validateAuthForm';
import type {AuthNavigationProp} from '@navigation/types';
import {signInWithEmail} from '@features/auth/slice/authThunks';

export function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp<'Login'>>();
  const {
    rememberedEmail,
    isAuthenticating,
    errorMessage,
    clearError,
    signIn,
  } = useAuthController();

  const [email, setEmail] = useState(rememberedEmail ?? '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rememberedEmail) {
      setEmail(current => current || rememberedEmail);
    }
  }, [rememberedEmail]);

  const busy = isAuthenticating || isSubmitting;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors(current => ({...current, email: undefined}));
    }
    if (errorMessage) {
      clearError();
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors(current => ({...current, password: undefined}));
    }
    if (errorMessage) {
      clearError();
    }
  };

  const handleSubmit = async () => {
    if (busy) {
      return;
    }

    const result = validateLoginForm({email, password});
    if (!result.valid) {
      setFieldErrors(result.errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const action = await signIn(result.values);
      if (signInWithEmail.rejected.match(action)) {
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Welcome back"
      subtitle="Sign in to manage your tasks across devices."
      footerPrompt="Don't have an account?"
      footerActionLabel="Create account"
      footerDisabled={busy}
      onFooterPress={() => navigation.navigate('Signup')}>
      <FormErrorBanner
        message={errorMessage}
        accessibilityLabel="Sign in error"
      />

      <TextField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
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
        onChangeText={handlePasswordChange}
        error={fieldErrors.password}
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!busy}
        accessibilityLabel="Password"
      />

      <View style={styles.actions}>
        <Button
          label="Sign in"
          onPress={handleSubmit}
          loading={busy}
          disabled={busy}
          accessibilityLabel="Sign in"
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
