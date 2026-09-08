import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {Task} from '@features/tasks/types';
import {formatTaskDate} from '@features/tasks/utils/formatTaskDate';
import {useTheme} from '@theme/ThemeProvider';

export const TASK_ROW_HEIGHT = 88;

export interface TaskListItemProps {
  task: Task;
  onPress: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

function TaskListItemComponent({
  task,
  onPress,
  onToggleCompleted,
}: TaskListItemProps) {
  const {theme} = useTheme();
  const dueLabel = formatTaskDate(task.dueAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.completed ? 'Completed' : 'Incomplete'} task: ${task.title}`}
      accessibilityHint="Opens task details"
      onPress={() => onPress(task.id)}
      style={({pressed}) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{checked: task.completed}}
        accessibilityLabel={
          task.completed ? 'Mark task incomplete' : 'Mark task complete'
        }
        hitSlop={8}
        onPress={() => onToggleCompleted(task.id)}
        style={[
          styles.checkbox,
          task.completed
            ? {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primary,
              }
            : [styles.checkboxUnchecked, {borderColor: theme.colors.border}],
        ]}>
        {task.completed ? (
          <Text
            style={[styles.checkmark, {color: theme.colors.primaryContrast}]}>
            ✓
          </Text>
        ) : null}
      </Pressable>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            theme.typography.body,
            {color: theme.colors.textPrimary},
            task.completed ? styles.titleCompleted : null,
          ]}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          {dueLabel ? (
            <Text
              style={[
                styles.meta,
                theme.typography.caption,
                {color: theme.colors.textSecondary},
              ]}>
              Due {dueLabel}
            </Text>
          ) : (
            <Text
              style={[
                styles.meta,
                theme.typography.caption,
                {color: theme.colors.textSecondary},
              ]}>
              No due date
            </Text>
          )}
          {task.syncStatus !== 'synced' ? (
            <Text
              style={[
                styles.meta,
                theme.typography.caption,
                {color: theme.colors.warning},
              ]}>
              Pending sync
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function propsAreEqual(
  prev: TaskListItemProps,
  next: TaskListItemProps,
): boolean {
  return (
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.completed === next.task.completed &&
    prev.task.dueAt === next.task.dueAt &&
    prev.task.syncStatus === next.task.syncStatus &&
    prev.task.updatedAt === next.task.updatedAt &&
    prev.onPress === next.onPress &&
    prev.onToggleCompleted === next.onToggleCompleted
  );
}

export const TaskListItem = memo(TaskListItemComponent, propsAreEqual);

const styles = StyleSheet.create({
  row: {
    height: TASK_ROW_HEIGHT,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    flexShrink: 1,
  },
});
