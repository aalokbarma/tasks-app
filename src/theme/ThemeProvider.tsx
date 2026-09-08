import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import {useColorScheme} from 'react-native';

import type {ThemeMode} from '@app-types/common';

import type {AppTheme} from './createTheme';
import {createTheme, resolveColorScheme} from './createTheme';

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps extends PropsWithChildren {
  themeMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  themeMode = 'system',
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = resolveColorScheme(themeMode, systemScheme);
    return {
      theme: createTheme(resolved),
      themeMode,
    };
  }, [systemScheme, themeMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
