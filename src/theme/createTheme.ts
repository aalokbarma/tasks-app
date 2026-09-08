import type {ColorSchemeName} from 'react-native';

import type {ThemeMode} from '@app-types/common';

import type {ColorPalette} from './colors';
import {darkColors, lightColors} from './colors';
import type {Radii} from './radii';
import {radii} from './radii';
import type {ShadowStyles} from './shadows';
import {darkShadows, lightShadows} from './shadows';
import type {Spacing} from './spacing';
import {spacing} from './spacing';
import type {TypographyScale} from './typography';
import {typography} from './typography';

export interface AppTheme {
  /** Resolved appearance — never `'system'`. */
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: Spacing;
  radii: Radii;
  shadows: ShadowStyles;
}

export function resolveColorScheme(
  themeMode: ThemeMode,
  systemScheme: ColorSchemeName | null | undefined,
): 'light' | 'dark' {
  if (themeMode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return themeMode;
}

export function createTheme(mode: 'light' | 'dark'): AppTheme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    typography,
    spacing,
    radii,
    shadows: mode === 'dark' ? darkShadows : lightShadows,
  };
}

export const THEME_MODE_OPTIONS: ReadonlyArray<{
  value: ThemeMode;
  label: string;
  description: string;
}> = [
  {
    value: 'system',
    label: 'System',
    description: 'Match device appearance',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light theme',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
  },
];
