import {StyleSheet, Text, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';

interface ScreenPlaceholderProps {
  title: string;
  description: string;
}

export function ScreenPlaceholder({
  title,
  description,
}: ScreenPlaceholderProps) {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
      <Text
        style={[
          theme.typography.title,
          {
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.sm,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          theme.typography.body,
          {color: theme.colors.textSecondary},
        ]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
