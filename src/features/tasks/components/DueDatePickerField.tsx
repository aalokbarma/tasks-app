import {useMemo, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '@theme/ThemeProvider';
import {
  formatDueDateLabel,
  parseDateInputValue,
  toDateInputValue,
} from '@utils/dateInput';

export interface DueDatePickerFieldProps {
  label?: string;
  value: string;
  error?: string | null;
  editable?: boolean;
  onChange: (nextValue: string) => void;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildMonthCells(month: Date): Array<Date | null> {
  const first = startOfMonth(month);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const leading = first.getDay();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < leading; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DueDatePickerField({
  label = 'Due date',
  value,
  error,
  editable = true,
  onChange,
}: DueDatePickerFieldProps) {
  const {theme} = useTheme();
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => parseDateInputValue(value), [value]);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate ?? new Date()),
  );

  const displayValue = value.trim()
    ? formatDueDateLabel(value.trim())
    : 'Select a date';

  const borderColor = error
    ? theme.colors.danger
    : open
      ? theme.colors.focusRing
      : theme.colors.border;

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const today = useMemo(() => new Date(), []);

  const openPicker = () => {
    setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
    setOpen(true);
  };

  const closePicker = () => setOpen(false);

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const handleSelect = (date: Date) => {
    onChange(toDateInputValue(date));
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          theme.typography.label,
          {color: theme.colors.textSecondary, marginBottom: theme.spacing.xs},
        ]}>
        {label}
      </Text>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            value.trim() ? `Due date ${displayValue}` : 'Choose due date'
          }
          accessibilityHint="Opens a calendar to pick a due date"
          disabled={!editable}
          onPress={openPicker}
          style={({pressed}) => [
            styles.field,
            {
              flex: 1,
              borderColor,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.md,
              opacity: !editable ? 0.55 : pressed ? 0.92 : 1,
            },
          ]}>
          <Text
            style={[
              theme.typography.body,
              {
                color: value.trim()
                  ? theme.colors.textPrimary
                  : theme.colors.textTertiary,
              },
            ]}>
            {displayValue}
          </Text>
          <Text
            style={[theme.typography.caption, {color: theme.colors.primary}]}>
            Calendar
          </Text>
        </Pressable>

        {value.trim() && editable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear due date"
            onPress={handleClear}
            style={({pressed}) => [
              styles.clearButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceMuted,
                borderRadius: theme.radii.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Text
              style={[
                theme.typography.label,
                {color: theme.colors.textSecondary},
              ]}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            theme.typography.caption,
            {color: theme.colors.danger, marginTop: theme.spacing.xs},
          ]}>
          {error}
        </Text>
      ) : (
        <Text
          style={[
            theme.typography.caption,
            {color: theme.colors.textTertiary, marginTop: theme.spacing.xs},
          ]}>
          Optional. Tap to open the calendar.
        </Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <Pressable
          style={[styles.backdrop, {backgroundColor: theme.colors.overlay}]}
          onPress={closePicker}
          accessibilityLabel="Dismiss date picker"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
            },
          ]}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={handleClear} accessibilityRole="button">
              <Text
                style={[
                  theme.typography.bodyStrong,
                  {color: theme.colors.textSecondary},
                ]}>
                Clear
              </Text>
            </Pressable>
            <Text
              style={[
                theme.typography.bodyStrong,
                {color: theme.colors.textPrimary},
              ]}>
              Due date
            </Text>
            <Pressable onPress={closePicker} accessibilityRole="button">
              <Text
                style={[
                  theme.typography.bodyStrong,
                  {color: theme.colors.primary},
                ]}>
                Done
              </Text>
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => setVisibleMonth(current => addMonths(current, -1))}
              style={styles.navButton}>
              <Text
                style={[
                  theme.typography.title,
                  {color: theme.colors.primary, fontSize: 22},
                ]}>
                ‹
              </Text>
            </Pressable>
            <Text
              style={[
                theme.typography.bodyStrong,
                {color: theme.colors.textPrimary},
              ]}>
              {monthLabel}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => setVisibleMonth(current => addMonths(current, 1))}
              style={styles.navButton}>
              <Text
                style={[
                  theme.typography.title,
                  {color: theme.colors.primary, fontSize: 22},
                ]}>
                ›
              </Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map(day => (
              <Text
                key={day}
                style={[
                  styles.weekLabel,
                  theme.typography.caption,
                  {color: theme.colors.textTertiary},
                ]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const selected =
                selectedDate != null && sameCalendarDay(date, selectedDate);
              const isToday = sameCalendarDay(date, today);

              return (
                <Pressable
                  key={toDateInputValue(date)}
                  accessibilityRole="button"
                  accessibilityLabel={formatDueDateLabel(toDateInputValue(date))}
                  accessibilityState={{selected}}
                  onPress={() => handleSelect(date)}
                  style={[
                    styles.dayCell,
                    selected
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderRadius: theme.radii.full,
                        }
                      : isToday
                        ? {
                            borderWidth: 1,
                            borderColor: theme.colors.primary,
                            borderRadius: theme.radii.full,
                          }
                        : null,
                  ]}>
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color: selected
                          ? theme.colors.textOnPrimary
                          : theme.colors.textPrimary,
                        fontWeight: selected || isToday ? '700' : '400',
                      },
                    ]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  field: {
    minHeight: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearButton: {
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    minHeight: 52,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 28,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
