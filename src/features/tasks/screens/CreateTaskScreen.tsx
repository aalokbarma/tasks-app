import {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {Button} from '@components/ui/Button';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {HeaderTextButton} from '@components/ui/HeaderTextButton';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {
  ScreenContainer,
  SCREEN_EDGES_BELOW_HEADER,
} from '@components/layout/ScreenContainer';
import {TaskFormFields} from '@features/tasks/components/TaskFormFields';
import {useTasksController} from '@features/tasks/hooks/useTasksController';
import {
  emptyTaskFormValues,
  validateTaskForm,
  type TaskFormErrors,
  type TaskFormValues,
} from '@features/tasks/utils/validateTaskForm';
import {createTask as createTaskThunk} from '@features/tasks/slice/tasksThunks';
import {useAppNavigation} from '@navigation/hooks';
import {useTheme} from '@theme/ThemeProvider';

export function CreateTaskScreen() {
  const navigation = useAppNavigation<'CreateTask'>();
  const {theme} = useTheme();
  const {create, isSaving, errorMessage} = useTasksController();

  const [values, setValues] = useState<TaskFormValues>(emptyTaskFormValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = isSaving || isSubmitting;

  const handleChange = useCallback((patch: Partial<TaskFormValues>) => {
    setValues(current => ({...current, ...patch}));
    setErrors(current => {
      const next = {...current};
      if (patch.title !== undefined) {
        delete next.title;
      }
      if (patch.dueDate !== undefined) {
        delete next.dueDate;
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (busy) {
      return;
    }

    const result = validateTaskForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const action = await create(result.createInput);
      if (createTaskThunk.fulfilled.match(action)) {
        navigation.goBack();
        return;
      }

      Alert.alert(
        'Could not save task',
        typeof action.payload === 'string'
          ? action.payload
          : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [busy, create, navigation, values]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderTextButton
          label="Cancel"
          disabled={busy}
          accessibilityLabel="Cancel create task"
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <HeaderTextButton
          label="Save"
          prominence="strong"
          disabled={busy}
          accessibilityLabel="Save task"
          onPress={() => {
            handleSubmit().catch(() => undefined);
          }}
        />
      ),
    });
  }, [busy, handleSubmit, navigation]);

  return (
    <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
      <ConnectivityStatusBar />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.content,
            {
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
              paddingBottom: theme.spacing.xxl,
            },
          ]}>
          <FormErrorBanner
            message={errorMessage}
            accessibilityLabel="Create task error"
          />
          <TaskFormFields
            values={values}
            errors={errors}
            editable={!busy}
            onChange={handleChange}
          />
          <View style={{marginTop: theme.spacing.sm}}>
            <Button
              label="Save task"
              onPress={handleSubmit}
              loading={busy}
              disabled={busy}
              accessibilityLabel="Save task"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
