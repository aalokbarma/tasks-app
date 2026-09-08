/**
 * @format
 */

import {
  createTheme,
  resolveColorScheme,
  THEME_MODE_OPTIONS,
} from '../src/theme/createTheme';
import {lightColors, darkColors} from '../src/theme/colors';
import {radii} from '../src/theme/radii';
import {spacing} from '../src/theme/spacing';

describe('theme tokens', () => {
  it('resolves system mode from the device scheme', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });

  it('honors an explicit light or dark preference', () => {
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });

  it('builds a complete AppTheme for both schemes', () => {
    const light = createTheme('light');
    const dark = createTheme('dark');

    expect(light.mode).toBe('light');
    expect(light.colors).toEqual(lightColors);
    expect(dark.colors).toEqual(darkColors);

    expect(light.spacing).toBe(spacing);
    expect(light.radii).toBe(radii);
    expect(light.typography.body.fontSize).toBeGreaterThan(0);
    expect(light.shadows.md).toBeDefined();
    expect(dark.shadows.sm).toBeDefined();
  });

  it('keeps primary text contrast tokens for filled controls', () => {
    expect(lightColors.textOnPrimary).toBeTruthy();
    expect(darkColors.textOnPrimary).toBeTruthy();
    expect(lightColors.dangerMuted).not.toEqual(darkColors.dangerMuted);
  });

  it('exposes preference options for the settings selector', () => {
    expect(THEME_MODE_OPTIONS.map(option => option.value)).toEqual([
      'system',
      'light',
      'dark',
    ]);
  });
});
