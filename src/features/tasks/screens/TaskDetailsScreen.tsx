import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
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
import {LoadingState} from '@components/ui/LoadingState';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {
  ScreenContainer,
  SCREEN_EDGES_BELOW_HEADER,
} from '@components/layout/ScreenContainer';
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
            prominence="strong"
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
      'This removes the task from this device and queues the delete for sync when you are online.',
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
      <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
        <ConnectivityStatusBar />
        <LoadingState label="Loading task…" />
      </ScreenContainer>
    );
  }

  if (!task) {
    return (
      <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
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
  const pendingSync = task.syncStatus !== 'synced';

  return (
    <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
      <ConnectivityStatusBar />
      <ScrollView
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
          accessibilityLabel="Task details error"
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.compact,
            },
            theme.shadows.sm,
          ]}>
          <View
            style={[
              styles.statusRow,
              {gap: theme.spacing.sm, marginBottom: theme.spacing.xs},
            ]}>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: task.completed
                    ? theme.colors.successMuted
                    : theme.colors.primaryMuted,
                  borderRadius: theme.radii.full,
                },
              ]}>
              <Text
                style={[
                  theme.typography.caption,
                  {
                    color: task.completed
                      ? theme.colors.success
                      : theme.colors.primary,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  },
                ]}>
                {task.completed ? 'Completed' : 'Active'}
              </Text>
            </View>
            {pendingSync ? (
              <Text
                style={[
                  theme.typography.caption,
                  {color: theme.colors.textSecondary},
                ]}>
                On this device
              </Text>
            ) : null}
          </View>

          <Text
            accessibilityRole="header"
            style={[
              theme.typography.title,
              {
                color: theme.colors.textPrimary,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              },
            ]}>
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.textPrimary,
                  marginTop: theme.spacing.xs,
                },
              ]}>
              {task.description}
            </Text>
          ) : (
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.textTertiary,
                  marginTop: theme.spacing.xs,
                },
              ]}>
              No description
            </Text>
          )}

          <View
            style={[
              styles.metaBlock,
              {
                marginTop: theme.spacing.md,
                paddingTop: theme.spacing.md,
                borderTopColor: theme.colors.separator,
                gap: theme.spacing.compact,
              },
            ]}>
            <MetaRow label="Due" value={dueLabel ?? 'None'} />
            <MetaRow label="Updated" value={updatedLabel ?? '—'} />
          </View>
        </View>

        <View style={{gap: theme.spacing.compact}}>
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
    <View style={{gap: theme.spacing.xxs}}>
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        {label}
      </Text>
      <Text
        style={[
          theme.typography.bodyStrong,
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
  content: {},
  card: {
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
