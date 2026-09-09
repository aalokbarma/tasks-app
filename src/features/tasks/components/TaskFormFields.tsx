import {Pressable, StyleSheet, Text, View} from 'react-native';

import {TextField} from '@components/ui/TextField';
import {useTheme} from '@theme/ThemeProvider';

import {DueDatePickerField} from './DueDatePickerField';
import type {TaskFormErrors, TaskFormValues} from '../utils/validateTaskForm';

export interface TaskFormFieldsProps {
  values: TaskFormValues;
  errors: TaskFormErrors;
  editable?: boolean;
  onChange: (patch: Partial<TaskFormValues>) => void;
}

export function TaskFormFields({
  values,
  errors,
  editable = true,
  onChange,
}: TaskFormFieldsProps) {
  const {theme} = useTheme();
  const reminderEnabled = Boolean(values.dueDate.trim());

  return (
    <View style={{gap: theme.spacing.md}}>
      <TextField
        label="Title"
        value={values.title}
        onChangeText={title => onChange({title})}
        error={errors.title}
        editable={editable}
        autoCapitalize="sentences"
        returnKeyType="next"
        accessibilityLabel="Task title"
        placeholder="What needs doing?"
      />
      <TextField
        label="Description"
        value={values.description}
        onChangeText={description => onChange({description})}
        editable={editable}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        inputStyle={styles.descriptionInput}
        accessibilityLabel="Task description"
        placeholder="Optional notes"
      />

      <DueDatePickerField
        value={values.dueDate}
        error={errors.dueDate}
        editable={editable}
        onChange={dueDate =>
          onChange({
            dueDate,
            remindOnDueDate: dueDate.trim()
              ? values.dueDate.trim()
                ? values.remindOnDueDate
                : true
              : false,
          })
        }
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: values.remindOnDueDate,
          disabled: !editable || !reminderEnabled,
        }}
        accessibilityLabel="Remind me on the due date"
        accessibilityHint={
          reminderEnabled
            ? 'Schedules a local notification for the due date'
            : 'Add a due date to enable reminders'
        }
        disabled={!editable || !reminderEnabled}
        onPress={() => onChange({remindOnDueDate: !values.remindOnDueDate})}
        style={({pressed}) => [
          styles.reminderRow,
          {
            borderColor: values.remindOnDueDate
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: values.remindOnDueDate
              ? theme.colors.primaryMuted
              : theme.colors.surface,
            borderRadius: theme.radii.md,
            opacity: !reminderEnabled || !editable ? 0.5 : pressed ? 0.92 : 1,
          },
        ]}>
        <View
          style={[
            styles.checkbox,
            {
              borderRadius: theme.radii.sm,
              borderColor: values.remindOnDueDate
                ? theme.colors.primary
                : theme.colors.borderStrong,
              backgroundColor: values.remindOnDueDate
                ? theme.colors.primary
                : 'transparent',
            },
          ]}>
          {values.remindOnDueDate ? (
            <Text
              style={[styles.checkmark, {color: theme.colors.textOnPrimary}]}>
              ✓
            </Text>
          ) : null}
        </View>
        <View style={{flex: 1, gap: theme.spacing.xxs}}>
          <Text
            style={[
              theme.typography.bodyStrong,
              {color: theme.colors.textPrimary},
            ]}>
            Remind me on due date
          </Text>
          <Text
            style={[
              theme.typography.caption,
              {color: theme.colors.textSecondary},
            ]}>
            {reminderEnabled
              ? 'Local notification — works offline. Permission is optional.'
              : 'Pick a due date first to enable reminders.'}
          </Text>
        </View>
      </Pressable>

      <Text
        style={[theme.typography.caption, {color: theme.colors.textTertiary}]}>
        Saved on this device first. Sync runs when you are online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  reminderRow: {
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 72,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});
