import type {PropsWithChildren} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {ScreenContainer} from '@components/layout/ScreenContainer';
import {useTheme} from '@theme/ThemeProvider';

export interface AuthFormLayoutProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footerPrompt: string;
  footerActionLabel: string;
  onFooterPress: () => void;
  footerDisabled?: boolean;
}

export function AuthFormLayout({
  title,
  subtitle,
  footerPrompt,
  footerActionLabel,
  onFooterPress,
  footerDisabled = false,
  children,
}: AuthFormLayoutProps) {
  const {theme} = useTheme();

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {paddingHorizontal: theme.spacing.lg},
          ]}>
          <View style={styles.brandBlock}>
            <Text
              accessibilityRole="header"
              style={[
                styles.brand,
                theme.typography.caption,
                {color: theme.colors.primary},
              ]}>
              TasksApp
            </Text>
            <Text
              style={[
                styles.title,
                theme.typography.title,
                {color: theme.colors.textPrimary},
              ]}>
              {title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                theme.typography.body,
                {color: theme.colors.textSecondary},
              ]}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.form}>{children}</View>

          <View style={styles.footer}>
            <Text
              style={[
                theme.typography.body,
                {color: theme.colors.textSecondary},
              ]}>
              {footerPrompt}{' '}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={footerActionLabel}
              accessibilityState={{disabled: footerDisabled}}
              disabled={footerDisabled}
              onPress={onFooterPress}
              hitSlop={8}>
              <Text
                style={[
                  styles.footerAction,
                  theme.typography.body,
                  {color: theme.colors.primary},
                ]}>
                {footerActionLabel}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  brandBlock: {
    marginBottom: 28,
  },
  brand: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontWeight: '700',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 360,
  },
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAction: {
    fontWeight: '600',
  },
});
