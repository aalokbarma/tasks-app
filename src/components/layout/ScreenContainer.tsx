import type {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '@theme/ThemeProvider';

export type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

type ScreenContainerProps = PropsWithChildren<{
  /**
   * Which safe-area insets to apply.
   * Prefer omitting `top` under a React Navigation header to avoid double padding.
   * Default: all edges (full-bleed / auth screens without a header).
   */
  edges?: ReadonlyArray<SafeAreaEdge>;
}>;

const DEFAULT_EDGES: ReadonlyArray<SafeAreaEdge> = [
  'top',
  'bottom',
  'left',
  'right',
];

/** Screens that sit under a stack header. */
export const SCREEN_EDGES_BELOW_HEADER: ReadonlyArray<SafeAreaEdge> = [
  'bottom',
  'left',
  'right',
];

export function ScreenContainer({
  children,
  edges = DEFAULT_EDGES,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const apply = new Set(edges);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: apply.has('top') ? insets.top : 0,
          paddingBottom: apply.has('bottom') ? insets.bottom : 0,
          paddingLeft: apply.has('left') ? insets.left : 0,
          paddingRight: apply.has('right') ? insets.right : 0,
        },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
