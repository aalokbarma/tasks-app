import {StyleSheet, Text, View} from 'react-native';

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
        onChangeText={dueDate => onChange({dueDate})}
        error={errors.dueDate}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
        placeholder="Optional"
        accessibilityLabel="Due date"
      />
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
  hint: {
    marginTop: -4,
  },
});
