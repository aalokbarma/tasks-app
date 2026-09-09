import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {EmptyState} from '@components/ui/EmptyState';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {LoadingState} from '@components/ui/LoadingState';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {
  ScreenContainer,
  SCREEN_EDGES_BELOW_HEADER,
} from '@components/layout/ScreenContainer';
import {
  TaskListItem,
  TASK_ROW_HEIGHT,
} from '@features/tasks/components/TaskListItem';
import {
  useTasksActions,
  useTasksListState,
} from '@features/tasks/hooks/useTasksController';
import {useIsOnline} from '@features/network/hooks/useNetwork';
import {runSynchronization} from '@features/sync/slice/syncThunks';
import {toggleTaskCompleted as toggleTaskCompletedThunk} from '@features/tasks/slice/tasksThunks';
import {completionToastMessage} from '@features/tasks/utils/completionToastMessage';
import type {Task} from '@features/tasks/types';
import {useAppDispatch} from '@store/hooks';
import {useAppNavigation} from '@navigation/hooks';
import {useTheme} from '@theme/ThemeProvider';
import {useToast} from '@components/ui/toast';

const LIST_ITEM_SPACING = 10;
const LIST_ITEM_LENGTH = TASK_ROW_HEIGHT + LIST_ITEM_SPACING;

function keyExtractor(item: Task): string {
  return item.id;
}

function getItemLayout(
  _: ArrayLike<Task> | null | undefined,
  index: number,
): {length: number; offset: number; index: number} {
  return {
    length: LIST_ITEM_LENGTH,
    offset: LIST_ITEM_LENGTH * index,
    index,
  };
}

export function TaskListScreen() {
  const navigation = useAppNavigation<'TaskList'>();
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const isOnline = useIsOnline();
  const {tasks, isLoading, errorMessage} = useTasksListState();
  const {refresh, toggleCompleted} = useTasksActions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refresh()
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setHasLoadedOnce(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh().unwrap();
      if (isOnline) {
        dispatch(runSynchronization());
      }
    } catch {
      // Error banner is driven by Redux.
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, isOnline, refresh]);

  const handleOpenTask = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetails', {taskId});
    },
    [navigation],
  );

  const handleToggleCompleted = useCallback(
    (taskId: string) => {
      toggleCompleted(taskId)
        .then(action => {
          if (toggleTaskCompletedThunk.fulfilled.match(action)) {
            showToast(completionToastMessage(action.payload.completed));
          }
        })
        .catch(() => undefined);
    },
    [showToast, toggleCompleted],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Task>) => (
      <TaskListItem
        task={item}
        onPress={handleOpenTask}
        onToggleCompleted={handleToggleCompleted}
      />
    ),
    [handleOpenTask, handleToggleCompleted],
  );

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      {
        paddingTop: theme.spacing.sm + 4,
        paddingBottom: theme.spacing.xl,
      },
    ],
    [theme.spacing.sm, theme.spacing.xl],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={theme.colors.primary}
        colors={[theme.colors.primary]}
      />
    ),
    [handleRefresh, isRefreshing, theme.colors.primary],
  );

  const emptyComponent = useMemo(
    () => (
      <EmptyState
        eyebrow="Offline ready"
        title="No tasks yet"
        description="Add your first task. It saves on this device immediately, then syncs when you’re online."
        actionLabel="Create task"
        onActionPress={handleCreate}
      />
    ),
    [handleCreate],
  );

  const showInitialLoading = isLoading && !hasLoadedOnce && tasks.length === 0;

  return (
    <ScreenContainer edges={SCREEN_EDGES_BELOW_HEADER}>
      <ConnectivityStatusBar />
      <View style={styles.body}>
        {errorMessage ? (
          <View
            style={[
              styles.errorWrap,
              {
                paddingHorizontal: theme.spacing.md,
                paddingTop: theme.spacing.sm + 4,
              },
            ]}>
            <FormErrorBanner
              message={errorMessage}
              accessibilityLabel="Tasks error"
            />
          </View>
        ) : null}

        {showInitialLoading ? (
          <LoadingState label="Loading your tasks…" />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
            updateCellsBatchingPeriod={50}
            windowSize={9}
            removeClippedSubviews
            contentContainerStyle={
              tasks.length === 0 ? styles.emptyListContent : listContentStyle
            }
            refreshControl={refreshControl}
            ListEmptyComponent={emptyComponent}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  errorWrap: {},
  listContent: {},
  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
