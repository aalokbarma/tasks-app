import {StyleSheet, Text, View} from 'react-native';

import {ScreenContainer} from '@components/layout/ScreenContainer';
import {Button} from '@components/ui/Button';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {ThemeModeSelector} from '@components/ui/ThemeModeSelector';
import {useAuthController} from '@features/auth/hooks/useAuthController';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {selectThemeMode} from '@store/selectors';
import {setThemeMode} from '@store/themeSlice';
import type {ThemeMode} from '@app-types/common';
import {THEME_MODE_OPTIONS} from '@theme/createTheme';
import {useTheme} from '@theme/ThemeProvider';

export function SettingsScreen() {
  const {theme, themeMode} = useTheme();
  const dispatch = useAppDispatch();
  const persistedMode = useAppSelector(selectThemeMode);
  const {user, isAuthenticating, errorMessage, clearError, signOut} =
    useAuthController();

  const preference = persistedMode ?? themeMode;
  const preferenceMeta = THEME_MODE_OPTIONS.find(
    option => option.value === preference,
  );

  const onThemeChange = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  return (
    <ScreenContainer>
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            gap: theme.spacing.md,
          },
        ]}>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.title,
            {color: theme.colors.textPrimary, marginBottom: theme.spacing.xs},
          ]}>
          Account
        </Text>
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.sm,
            },
          ]}>
          You are signed in. Tasks are scoped to this account only.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.xs,
            },
            theme.shadows.sm,
          ]}>
          <Text
            style={[
              theme.typography.overline,
              {
                color: theme.colors.textSecondary,
                textTransform: 'uppercase',
              },
            ]}>
            Signed in as
          </Text>
          <Text
            accessibilityLabel={`Signed in as ${user?.email ?? 'unknown user'}`}
            style={[
              theme.typography.bodyStrong,
              {color: theme.colors.textPrimary},
            ]}>
            {user?.displayName || user?.email || 'Signed in'}
          </Text>
          {user?.displayName && user.email ? (
            <Text
              style={[
                theme.typography.caption,
                {color: theme.colors.textSecondary, marginTop: theme.spacing.xxs},
              ]}>
              {user.email}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            },
            theme.shadows.sm,
          ]}>
          <Text
            accessibilityRole="header"
            style={[
              theme.typography.subtitle,
              {color: theme.colors.textPrimary},
            ]}>
            Appearance
          </Text>
          <Text
            style={[
              theme.typography.caption,
              {color: theme.colors.textSecondary},
            ]}>
            {preferenceMeta?.description ??
              'Choose light, dark, or follow the system setting.'}
            {preference === 'system'
              ? ` Currently using ${theme.mode} mode.`
              : ''}
          </Text>
          <ThemeModeSelector value={preference} onChange={onThemeChange} />
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
  },
  card: {
    borderWidth: 1,
  },
});
