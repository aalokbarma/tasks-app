import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {ThemeMode} from '@app-types/common';
import {THEME_MODE_OPTIONS} from '@theme/createTheme';
import {useTheme} from '@theme/ThemeProvider';

export interface ThemeModeSelectorProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

/**
 * Segmented control for light / dark / system preference.
 */
export function ThemeModeSelector({value, onChange}: ThemeModeSelectorProps) {
  const {theme} = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
      style={styles.root}>
      {THEME_MODE_OPTIONS.map(option => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{selected}}
            accessibilityLabel={`${option.label}. ${option.description}`}
            onPress={() => onChange(option.value)}
            style={({pressed}) => [
              styles.option,
              {
                borderRadius: theme.radii.md,
                backgroundColor: selected
                  ? theme.colors.primary
                  : theme.colors.surfaceMuted,
                opacity: pressed && !selected ? 0.85 : 1,
              },
            ]}>
            <Text
              style={[
                theme.typography.label,
                {
                  color: selected
                    ? theme.colors.textOnPrimary
                    : theme.colors.textPrimary,
                  textAlign: 'center',
                },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
});
