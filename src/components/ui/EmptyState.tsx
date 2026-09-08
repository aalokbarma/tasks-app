import {StyleSheet, Text, View} from 'react-native';

import {Button} from '@components/ui/Button';
import {useTheme} from '@theme/ThemeProvider';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
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
          gap: theme.spacing.sm,
        },
      ]}
      accessibilityRole="summary">
      <View
        style={[
          styles.mark,
          {
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: theme.radii.full,
            marginBottom: theme.spacing.sm,
          },
        ]}>
        <Text
          style={[theme.typography.subtitle, {color: theme.colors.primary}]}>
          ✓
        </Text>
      </View>
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
            maxWidth: 320,
          },
        ]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <View
          style={[styles.action, {marginTop: theme.spacing.md, maxWidth: 280}]}>
          <Button label={actionLabel} onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
