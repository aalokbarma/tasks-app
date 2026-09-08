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
import {EmptyState} from '@components/ui/EmptyState';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {HeaderTextButton} from '@components/ui/HeaderTextButton';
import {LoadingState} from '@components/ui/LoadingState';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {
  ScreenContainer,
  SCREEN_EDGES_BELOW_HEADER,
} from '@components/layout/ScreenContainer';
import {TaskFormFields} from '@features/tasks/components/TaskFormFields';
import {useTaskById} from '@features/tasks/hooks/useTaskById';
import {useTasksController} from '@features/tasks/hooks/useTasksController';
import {
  taskToFormValues,
  toUpdateTaskInput,
  type TaskFormErrors,
  type TaskFormValues,
} from '@features/tasks/utils/validateTaskForm';
import {updateTask as updateTaskThunk} from '@features/tasks/slice/tasksThunks';
import {useAppNavigation, useAppRoute} from '@navigation/hooks';
import {useTheme} from '@theme/ThemeProvider';

export function EditTaskScreen() {
  const navigation = useAppNavigation<'EditTask'>();
  const route = useAppRoute<'EditTask'>();
  const {taskId} = route.params;
  const {theme} = useTheme();
  const task = useTaskById(taskId);
  const {refresh, update, isLoading, isSaving, errorMessage} =
    useTasksController();

  const [values, setValues] = useState<TaskFormValues | null>(
    task ? taskToFormValues(task) : null,
  );
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!task);

  useEffect(() => {
    if (task) {
      setValues(current => current ?? taskToFormValues(task));
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;
    refresh()
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refresh, task]);

  const busy = isSaving || isSubmitting;

  const handleChange = useCallback((patch: Partial<TaskFormValues>) => {
    setValues(current => (current ? {...current, ...patch} : current));
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
    if (!values || busy) {
      return;
    }

    const result = toUpdateTaskInput(taskId, values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const action = await update(result.input);
      if (updateTaskThunk.fulfilled.match(action)) {
        navigation.goBack();
        return;
      }

      Alert.alert(
        'Could not update task',
        typeof action.payload === 'string'
          ? action.payload
          : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [busy, navigation, taskId, update, values]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderTextButton
          label="Cancel"
          disabled={busy}
          accessibilityLabel="Cancel edit"
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <HeaderTextButton
          label="Save"
          prominence="strong"
          disabled={busy || !values}
          accessibilityLabel="Save changes"
          onPress={() => {
            handleSubmit().catch(() => undefined);
          }}
        />
      ),
    });
  }, [busy, handleSubmit, navigation, values]);

  if (isBootstrapping || (isLoading && !task)) {
    return (
      <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
        <ConnectivityStatusBar />
        <LoadingState label="Loading task…" />
      </ScreenContainer>
    );
  }

  if (!task || !values) {
    return (
      <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
        <ConnectivityStatusBar />
        <EmptyState
          title="Task not found"
          description="This task is no longer available to edit."
          actionLabel="Back to tasks"
          onActionPress={() => navigation.navigate('TaskList')}
        />
      </ScreenContainer>
    );
  }

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
            accessibilityLabel="Edit task error"
          />
          <TaskFormFields
            values={values}
            errors={errors}
            editable={!busy}
            onChange={handleChange}
          />
          <View style={{marginTop: theme.spacing.sm}}>
            <Button
              label="Save changes"
              onPress={handleSubmit}
              loading={busy}
              disabled={busy}
              accessibilityLabel="Save changes"
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
