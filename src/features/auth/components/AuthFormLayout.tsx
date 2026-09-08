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
  /** When true, skip top safe-area (screen already has a nav header). */
  belowHeader?: boolean;
}

export function AuthFormLayout({
  title,
  subtitle,
  footerPrompt,
  footerActionLabel,
  onFooterPress,
  footerDisabled = false,
  belowHeader = false,
  children,
}: AuthFormLayoutProps) {
  const {theme} = useTheme();

  return (
    <ScreenContainer
      edges={
        belowHeader
          ? ['bottom', 'left', 'right']
          : ['top', 'bottom', 'left', 'right']
      }>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (belowHeader ? 64 : 0) : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.xxl,
              gap: theme.spacing.xl,
            },
          ]}>
          <View style={{gap: theme.spacing.sm}}>
            <Text
              accessibilityRole="header"
              style={[
                theme.typography.overline,
                {
                  color: theme.colors.primary,
                  textTransform: 'uppercase',
                  marginBottom: theme.spacing.xs,
                },
              ]}>
              TasksApp
            </Text>
            <Text
              style={[
                theme.typography.display,
                {color: theme.colors.textPrimary},
              ]}>
              {title}
            </Text>
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.textSecondary,
                  maxWidth: 360,
                  marginTop: theme.spacing.xxs,
                },
              ]}>
              {subtitle}
            </Text>
          </View>

          <View style={{gap: theme.spacing.md}}>{children}</View>

          <View
            style={[
              styles.footer,
              {
                marginTop: theme.spacing.sm,
                paddingVertical: theme.spacing.sm,
                gap: theme.spacing.xs,
              },
            ]}>
            <Text
              style={[
                theme.typography.body,
                {color: theme.colors.textSecondary},
              ]}>
              {footerPrompt}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={footerActionLabel}
              accessibilityState={{disabled: footerDisabled}}
              disabled={footerDisabled}
              onPress={onFooterPress}
              hitSlop={12}
              style={({pressed}) => ({
                minHeight: 44,
                justifyContent: 'center',
                opacity: footerDisabled ? 0.45 : pressed ? 0.7 : 1,
              })}>
              <Text
                style={[
                  theme.typography.bodyStrong,
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
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
