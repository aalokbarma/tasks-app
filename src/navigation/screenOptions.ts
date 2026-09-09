import type {StackNavigationOptions} from '@react-navigation/stack';

import type {AppTheme} from '@theme/createTheme';

export function createDefaultStackOptions(
  theme: AppTheme,
): StackNavigationOptions {
  return {
    headerStyle: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 17,
      color: theme.colors.textPrimary,
    },
    headerShadowVisible: false,
    cardStyle: {
      backgroundColor: theme.colors.background,
    },
    animation: 'slide_from_right',
  };
}
