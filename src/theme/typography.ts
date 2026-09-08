import type {TextStyle, ViewStyle} from 'react-native';

type FontWeight = NonNullable<TextStyle['fontWeight']>;

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing?: number;
}

export interface TypographyScale {
  display: TypographyStyle;
  title: TypographyStyle;
  subtitle: TypographyStyle;
  body: TypographyStyle;
  bodyStrong: TypographyStyle;
  label: TypographyStyle;
  caption: TypographyStyle;
  overline: TypographyStyle;
  button: TypographyStyle;
}

/**
 * System UI fonts keep the take-home focused on tokens & hierarchy
 * rather than bundling custom typefaces.
 */
export const typography: TypographyScale = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
};

/** Convenience for applying typography + color in one object. */
export function textStyle(
  style: TypographyStyle,
  color: string,
): TextStyle {
  return {...style, color};
}

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

export type ShadowStyles = Record<ShadowLevel, ViewStyle>;
