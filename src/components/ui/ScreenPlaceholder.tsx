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
        {backgroundColor: theme.colors.background},
      ]}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.title.fontSize,
            lineHeight: theme.typography.title.lineHeight,
            fontWeight: theme.typography.title.fontWeight,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
            lineHeight: theme.typography.body.lineHeight,
          },
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
    paddingHorizontal: 24,
  },
  title: {
    marginBottom: 8,
  },
  description: {},
});
