import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import type {AppTheme} from '@theme/createTheme';

export function createDefaultStackOptions(
  theme: AppTheme,
): NativeStackNavigationOptions {
  return {
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
    animation: 'slide_from_right',
  };
}
