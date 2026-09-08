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
        },
      ]}
      accessibilityRole="summary">
      <Text
        style={[
          theme.typography.title,
          {
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
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
          style={[
            styles.action,
            {marginTop: theme.spacing.lg, maxWidth: 280},
          ]}>
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
  action: {
    alignSelf: 'stretch',
  },
});
