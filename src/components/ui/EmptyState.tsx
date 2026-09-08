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
    <View style={styles.root} accessibilityRole="summary">
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
          styles.description,
          theme.typography.body,
          {color: theme.colors.textSecondary},
        ]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <View style={styles.action}>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: 24,
    alignSelf: 'stretch',
    maxWidth: 280,
  },
});
