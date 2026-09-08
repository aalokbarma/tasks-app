import type {ColorSchemeName} from 'react-native';

import type {ThemeMode} from '@app-types/common';

import type {ColorPalette} from './colors';
import {darkColors, lightColors} from './colors';
import type {Spacing} from './spacing';
import {spacing} from './spacing';
import type {TypographyScale} from './typography';
import {typography} from './typography';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: Spacing;
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
  };
}
