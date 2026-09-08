import {Pressable, StyleSheet, Text, View} from 'react-native';

import {TextField} from '@components/ui/TextField';
import {useTheme} from '@theme/ThemeProvider';

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
    <View style={styles.root}>
      <TextField
        label="Title"
        value={values.title}
        onChangeText={title => onChange({title})}
        error={errors.title}
        editable={editable}
        autoCapitalize="sentences"
        returnKeyType="next"
        accessibilityLabel="Task title"
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
      />
      <TextField
        label="Due date (YYYY-MM-DD)"
        value={values.dueDate}
        onChangeText={dueDate =>
          onChange({
            dueDate,
            remindOnDueDate: dueDate.trim()
              ? values.remindOnDueDate
              : false,
          })
        }
        error={errors.dueDate}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
        placeholder="Optional"
        accessibilityLabel="Due date"
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: values.remindOnDueDate,
          disabled: !editable || !reminderEnabled,
        }}
        accessibilityLabel="Remind me on the due date"
        disabled={!editable || !reminderEnabled}
        onPress={() =>
          onChange({remindOnDueDate: !values.remindOnDueDate})
        }
        style={[
          styles.reminderRow,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: !reminderEnabled || !editable ? 0.55 : 1,
          },
        ]}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: values.remindOnDueDate
                ? theme.colors.primary
                : theme.colors.border,
              backgroundColor: values.remindOnDueDate
                ? theme.colors.primary
                : 'transparent',
            },
          ]}>
          {values.remindOnDueDate ? (
            <Text
              style={[
                styles.checkmark,
                {color: theme.colors.primaryContrast},
              ]}>
              ✓
            </Text>
          ) : null}
        </View>
        <View style={styles.reminderCopy}>
          <Text
            style={[
              styles.reminderTitle,
              theme.typography.body,
              {color: theme.colors.textPrimary},
            ]}>
            Remind me on due date
          </Text>
          <Text
            style={[
              theme.typography.caption,
              {color: theme.colors.textSecondary},
            ]}>
            Schedules a local notification. Works offline; permission optional.
          </Text>
        </View>
      </Pressable>

      <Text
        style={[
          styles.hint,
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        Saved on this device first. Sync runs when you are online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  descriptionInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  reminderRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
  reminderCopy: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    fontWeight: '600',
  },
  hint: {
    marginTop: -4,
  },
});
