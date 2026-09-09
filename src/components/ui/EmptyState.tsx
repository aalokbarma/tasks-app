import {StyleSheet, Text, View} from 'react-native';

import {Button} from '@components/ui/Button';
import {useTheme} from '@theme/ThemeProvider';

export interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xxl,
        },
      ]}
      accessibilityRole="summary">
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.xl,
            gap: theme.spacing.sm,
            ...theme.shadows.sm,
          },
        ]}>
        <View
          style={[
            styles.mark,
            {
              backgroundColor: theme.colors.primaryMuted,
              borderRadius: theme.radii.full,
              marginBottom: theme.spacing.xs,
            },
          ]}>
          <Text
            style={[
              theme.typography.title,
              {color: theme.colors.primary, fontSize: 28, lineHeight: 32},
            ]}>
            ✓
          </Text>
        </View>

        {eyebrow ? (
          <Text
            style={[
              theme.typography.overline,
              {
                color: theme.colors.primary,
                textAlign: 'center',
                textTransform: 'uppercase',
              },
            ]}>
            {eyebrow}
          </Text>
        ) : null}

        <Text
          style={[
            theme.typography.title,
            {
              color: theme.colors.textPrimary,
              textAlign: 'center',
            },
          ]}>
          {title}
        </Text>
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              maxWidth: 300,
              alignSelf: 'center',
            },
          ]}>
          {description}
        </Text>

        {actionLabel && onActionPress ? (
          <View style={[styles.action, {marginTop: theme.spacing.md}]}>
            <Button label={actionLabel} onPress={onActionPress} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  mark: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
