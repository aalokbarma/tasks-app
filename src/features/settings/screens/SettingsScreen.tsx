import {StyleSheet, Text, View} from 'react-native';

import {ScreenContainer} from '@components/layout/ScreenContainer';
import {Button} from '@components/ui/Button';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {useAuthController} from '@features/auth/hooks/useAuthController';
import {useTheme} from '@theme/ThemeProvider';

export function SettingsScreen() {
  const {theme} = useTheme();
  const {user, isAuthenticating, errorMessage, clearError, signOut} =
    useAuthController();

  return (
    <ScreenContainer>
      <View
        style={[
          styles.content,
          {paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg},
        ]}>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            theme.typography.title,
            {color: theme.colors.textPrimary},
          ]}>
          Account
        </Text>
        <Text
          style={[
            styles.subtitle,
            theme.typography.body,
            {color: theme.colors.textSecondary},
          ]}>
          You are signed in. Tasks are scoped to this account only.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {color: theme.colors.textSecondary},
            ]}>
            Signed in as
          </Text>
          <Text
            accessibilityLabel={`Signed in as ${user?.email ?? 'unknown user'}`}
            style={[
              styles.value,
              theme.typography.body,
              {color: theme.colors.textPrimary},
            ]}>
            {user?.displayName || user?.email || 'Signed in'}
          </Text>
          {user?.displayName && user.email ? (
            <Text
              style={[
                styles.email,
                theme.typography.caption,
                {color: theme.colors.textSecondary},
              ]}>
              {user.email}
            </Text>
          ) : null}
        </View>

        <FormErrorBanner
          message={errorMessage}
          accessibilityLabel="Sign out error"
        />

        <Button
          label="Sign out"
          variant="danger"
          loading={isAuthenticating}
          disabled={isAuthenticating}
          onPress={() => {
            if (errorMessage) {
              clearError();
            }
            signOut().catch(() => undefined);
          }}
          accessibilityLabel="Sign out"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontWeight: '600',
  },
  email: {
    marginTop: 2,
  },
});
