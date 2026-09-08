/**
 * Spacing scale in density-independent pixels.
 * Prefer these tokens over raw numbers in layout styles.
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  /** Compact gap / tight padding */
  compact: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type Spacing = typeof spacing;
export type SpacingToken = keyof Spacing;
