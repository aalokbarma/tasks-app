import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {Task} from '@features/tasks/types';
import {formatTaskDate} from '@features/tasks/utils/formatTaskDate';
import {useTheme} from '@theme/ThemeProvider';

export const TASK_ROW_HEIGHT = 92;

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
  const pendingSync = task.syncStatus !== 'synced';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.completed ? 'Completed' : 'Incomplete'} task: ${task.title}${pendingSync ? ', saved on this device' : ''}`}
      accessibilityHint="Opens task details"
      onPress={() => onPress(task.id)}
      style={({pressed}) => [
        styles.row,
        {
          height: TASK_ROW_HEIGHT,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          marginHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.sm + 2,
          opacity: pressed ? 0.92 : 1,
        },
        theme.shadows.sm,
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
          {
            borderRadius: theme.radii.sm,
            borderColor: task.completed
              ? theme.colors.primary
              : theme.colors.borderStrong,
            backgroundColor: task.completed
              ? theme.colors.primary
              : 'transparent',
          },
        ]}>
        {task.completed ? (
          <Text
            style={[styles.checkmark, {color: theme.colors.textOnPrimary}]}>
            ✓
          </Text>
        ) : null}
      </Pressable>

      <View style={[styles.content, {gap: theme.spacing.xs}]}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.bodyStrong,
            {
              color: theme.colors.textPrimary,
              textDecorationLine: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.62 : 1,
            },
          ]}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text
            numberOfLines={1}
            style={[
              theme.typography.caption,
              {color: theme.colors.textSecondary, flexShrink: 1},
            ]}>
            {dueLabel ? `Due ${dueLabel}` : 'No due date'}
          </Text>
          {pendingSync ? (
            <View
              accessibilityLabel="Saved on this device, waiting to sync"
              style={[
                styles.pendingChip,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderRadius: theme.radii.full,
                },
              ]}>
              <View
                style={[
                  styles.pendingDot,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.full,
                  },
                ]}
              />
              <Text
                style={[
                  theme.typography.caption,
                  {color: theme.colors.primary, fontWeight: '600'},
                ]}>
                Local
              </Text>
            </View>
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
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  content: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingDot: {
    width: 6,
    height: 6,
  },
});
