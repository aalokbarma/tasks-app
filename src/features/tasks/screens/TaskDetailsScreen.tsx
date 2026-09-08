import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Button} from '@components/ui/Button';
import {EmptyState} from '@components/ui/EmptyState';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {HeaderTextButton} from '@components/ui/HeaderTextButton';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {ScreenContainer} from '@components/layout/ScreenContainer';
import {useTaskById} from '@features/tasks/hooks/useTaskById';
import {useTasksController} from '@features/tasks/hooks/useTasksController';
import {
  formatTaskDate,
  formatTaskDateTime,
} from '@features/tasks/utils/formatTaskDate';
import {
  deleteTask as deleteTaskThunk,
  toggleTaskCompleted as toggleTaskCompletedThunk,
} from '@features/tasks/slice/tasksThunks';
import {useAppNavigation, useAppRoute} from '@navigation/hooks';
import {useTheme} from '@theme/ThemeProvider';

export function TaskDetailsScreen() {
  const navigation = useAppNavigation<'TaskDetails'>();
  const route = useAppRoute<'TaskDetails'>();
  const {taskId} = route.params;
  const {theme} = useTheme();
  const task = useTaskById(taskId);
  const {refresh, remove, toggleCompleted, isLoading, isSaving, errorMessage} =
    useTasksController();
  const [isBootstrapping, setIsBootstrapping] = useState(!task);

  useEffect(() => {
    if (task) {
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: task?.title ? truncate(task.title, 28) : 'Task',
      headerRight: () =>
        task ? (
          <HeaderTextButton
            label="Edit"
            accessibilityLabel="Edit task"
            onPress={() => navigation.navigate('EditTask', {taskId: task.id})}
          />
        ) : null,
    });
  }, [navigation, task]);

  const handleToggle = useCallback(async () => {
    const action = await toggleCompleted(taskId);
    if (toggleTaskCompletedThunk.rejected.match(action)) {
      Alert.alert(
        'Could not update task',
        typeof action.payload === 'string'
          ? action.payload
          : 'Please try again.',
      );
    }
  }, [taskId, toggleCompleted]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete task?',
      'This removes the task from this device and queues the delete for sync.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(taskId)
              .then(action => {
                if (deleteTaskThunk.fulfilled.match(action)) {
                  navigation.goBack();
                  return;
                }

                Alert.alert(
                  'Could not delete task',
                  typeof action.payload === 'string'
                    ? action.payload
                    : 'Please try again.',
                );
              })
              .catch(() => undefined);
          },
        },
      ],
    );
  }, [navigation, remove, taskId]);

  if (isBootstrapping || (isLoading && !task)) {
    return (
      <ScreenContainer>
        <ConnectivityStatusBar />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!task) {
    return (
      <ScreenContainer>
        <ConnectivityStatusBar />
        <EmptyState
          title="Task not found"
          description="It may have been deleted, or it belongs to another account."
          actionLabel="Back to tasks"
          onActionPress={() => navigation.navigate('TaskList')}
        />
      </ScreenContainer>
    );
  }

  const dueLabel = formatTaskDate(task.dueAt);
  const updatedLabel = formatTaskDateTime(task.updatedAt);

  return (
    <ScreenContainer>
      <ConnectivityStatusBar />
      <ScrollView contentContainerStyle={[styles.content, {padding: theme.spacing.lg}]}>
        <FormErrorBanner
          message={errorMessage}
          accessibilityLabel="Task details error"
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              theme.typography.title,
              {color: theme.colors.textPrimary},
              task.completed ? styles.titleCompleted : null,
            ]}>
            {task.title}
          </Text>

          <Text
            style={[
              styles.status,
              theme.typography.caption,
              {
                color: task.completed
                  ? theme.colors.success
                  : theme.colors.textSecondary,
              },
            ]}>
            {task.completed ? 'Completed' : 'Active'}
            {task.syncStatus !== 'synced' ? ' · On this device' : ''}
          </Text>

          {task.description ? (
            <Text
              style={[
                styles.description,
                theme.typography.body,
                {color: theme.colors.textPrimary},
              ]}>
              {task.description}
            </Text>
          ) : (
            <Text
              style={[
                styles.description,
                theme.typography.body,
                {color: theme.colors.textSecondary},
              ]}>
              No description
            </Text>
          )}

          <View style={styles.metaBlock}>
            <MetaRow label="Due" value={dueLabel ?? 'None'} />
            <MetaRow label="Updated" value={updatedLabel ?? '—'} />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            onPress={handleToggle}
            loading={isSaving}
            disabled={isSaving}
            accessibilityLabel={
              task.completed ? 'Mark task incomplete' : 'Mark task complete'
            }
          />
          <Button
            label="Edit task"
            variant="secondary"
            disabled={isSaving}
            onPress={() => navigation.navigate('EditTask', {taskId: task.id})}
            accessibilityLabel="Edit task"
          />
          <Button
            label="Delete task"
            variant="danger"
            disabled={isSaving}
            onPress={handleDelete}
            accessibilityLabel="Delete task"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MetaRow({label, value}: {label: string; value: string}) {
  const {theme} = useTheme();

  return (
    <View style={styles.metaRow}>
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          theme.typography.body,
          {color: theme.colors.textPrimary},
        ]}>
        {value}
      </Text>
    </View>
  );
}

function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}…`;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  title: {
    marginBottom: 0,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  status: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    marginTop: 4,
  },
  metaBlock: {
    marginTop: 8,
    gap: 10,
  },
  metaRow: {
    gap: 2,
  },
  metaValue: {
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
});
