import {Platform, type ViewStyle} from 'react-native';

import type {ShadowStyles} from './typography';

function iosShadow(
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: {width: 0, height: offsetY},
    },
    android: {
      elevation,
    },
    default: {
      elevation,
    },
  }) as ViewStyle;
}

/** Soft elevation — kept subtle so cards don’t look heavy or “AI glow”. */
export const lightShadows: ShadowStyles = {
  none: {},
  sm: iosShadow(0.06, 4, 1, 2),
  md: iosShadow(0.1, 8, 3, 4),
  lg: iosShadow(0.14, 16, 6, 8),
};

export const darkShadows: ShadowStyles = {
  none: {},
  // Dark surfaces use lighter elevation via border more than shadow,
  // but keep a faint lift for sticky / floating elements.
  sm: iosShadow(0.35, 4, 1, 2),
  md: iosShadow(0.4, 10, 4, 5),
  lg: iosShadow(0.5, 18, 8, 10),
};

export type {ShadowStyles};
