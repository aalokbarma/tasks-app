export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 999,
} as const;

export type Radii = typeof radii;
export type RadiusToken = keyof Radii;
