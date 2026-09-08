/**
 * Centralized color tokens for light and dark themes.
 * Components should consume these via `useTheme().theme.colors` — never hardcode hex.
 */
export interface ColorPalette {
  /** App canvas / screen background */
  background: string;
  /** Cards, sheets, inputs */
  surface: string;
  /** Slightly elevated surface (modals, sticky headers) */
  surfaceElevated: string;
  /** Subtle filled regions (chips, muted rows) */
  surfaceMuted: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  /** Text on solid primary / danger fills */
  textOnPrimary: string;
  textOnDanger: string;

  border: string;
  borderStrong: string;
  focusRing: string;
  overlay: string;
  separator: string;

  primary: string;
  primaryMuted: string;
  primaryContrast: string;

  danger: string;
  dangerMuted: string;
  dangerContrast: string;

  success: string;
  successMuted: string;

  warning: string;
  warningMuted: string;

  /** Connectivity / sync status strip tokens */
  statusOfflineBackground: string;
  statusOfflineBorder: string;
  statusOfflineText: string;
  statusOfflineDot: string;

  statusInfoBackground: string;
  statusInfoBorder: string;
  statusInfoText: string;
  statusInfoDot: string;

  statusPendingBackground: string;
  statusPendingBorder: string;
  statusPendingText: string;
  statusPendingDot: string;

  statusWarningBackground: string;
  statusWarningBorder: string;
  statusWarningText: string;
  statusWarningDot: string;
}

/** Warm stone + teal — professional, accessible contrast on both schemes. */
export const lightColors: ColorPalette = {
  background: '#F5F2ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EFEBE6',

  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#78716C',
  textOnPrimary: '#FFFFFF',
  textOnDanger: '#FFFFFF',

  border: '#E7E5E4',
  borderStrong: '#D6D3D1',
  focusRing: '#0F766E',
  overlay: 'rgba(28, 25, 23, 0.45)',
  separator: '#E7E5E4',

  primary: '#0F766E',
  primaryMuted: '#CCFBF1',
  primaryContrast: '#FFFFFF',

  danger: '#B91C1C',
  dangerMuted: '#FEF2F2',
  dangerContrast: '#FFFFFF',

  success: '#15803D',
  successMuted: '#F0FDF4',

  warning: '#C2410C',
  warningMuted: '#FFF7ED',

  statusOfflineBackground: '#F5F5F4',
  statusOfflineBorder: '#E7E5E4',
  statusOfflineText: '#57534E',
  statusOfflineDot: '#78716C',

  statusInfoBackground: '#F0FDFA',
  statusInfoBorder: '#99F6E4',
  statusInfoText: '#0F766E',
  statusInfoDot: '#0F766E',

  statusPendingBackground: '#F8FAFC',
  statusPendingBorder: '#E2E8F0',
  statusPendingText: '#475569',
  statusPendingDot: '#0F766E',

  statusWarningBackground: '#FFF7ED',
  statusWarningBorder: '#FED7AA',
  statusWarningText: '#C2410C',
  statusWarningDot: '#EA580C',
};

export const darkColors: ColorPalette = {
  background: '#0C0A09',
  surface: '#1C1917',
  surfaceElevated: '#292524',
  surfaceMuted: '#292524',

  textPrimary: '#FAFAF9',
  textSecondary: '#A8A29E',
  textTertiary: '#78716C',
  textOnPrimary: '#042F2E',
  textOnDanger: '#FFFFFF',

  border: '#292524',
  borderStrong: '#44403C',
  focusRing: '#2DD4BF',
  overlay: 'rgba(0, 0, 0, 0.55)',
  separator: '#292524',

  primary: '#2DD4BF',
  primaryMuted: 'rgba(45, 212, 191, 0.16)',
  primaryContrast: '#042F2E',

  danger: '#F87171',
  dangerMuted: 'rgba(248, 113, 113, 0.16)',
  dangerContrast: '#FFFFFF',

  success: '#4ADE80',
  successMuted: 'rgba(74, 222, 128, 0.14)',

  warning: '#FB923C',
  warningMuted: 'rgba(251, 146, 60, 0.14)',

  statusOfflineBackground: 'rgba(168, 162, 158, 0.12)',
  statusOfflineBorder: '#44403C',
  statusOfflineText: '#D6D3D1',
  statusOfflineDot: '#A8A29E',

  statusInfoBackground: 'rgba(45, 212, 191, 0.12)',
  statusInfoBorder: '#115E59',
  statusInfoText: '#5EEAD4',
  statusInfoDot: '#2DD4BF',

  statusPendingBackground: 'rgba(45, 212, 191, 0.08)',
  statusPendingBorder: '#334155',
  statusPendingText: '#94A3B8',
  statusPendingDot: '#2DD4BF',

  statusWarningBackground: 'rgba(251, 146, 60, 0.14)',
  statusWarningBorder: '#9A3412',
  statusWarningText: '#FB923C',
  statusWarningDot: '#FB923C',
};
