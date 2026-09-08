import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {EmptyState} from '@components/ui/EmptyState';
import {FormErrorBanner} from '@components/ui/FormErrorBanner';
import {ConnectivityStatusBar} from '@components/ui/ConnectivityStatusBar';
import {ScreenContainer} from '@components/layout/ScreenContainer';
import {
  TaskListItem,
  TASK_ROW_HEIGHT,
} from '@features/tasks/components/TaskListItem';
import {useTasksController} from '@features/tasks/hooks/useTasksController';
import {useIsOnline} from '@features/network/hooks/useNetwork';
import {runSynchronization} from '@features/sync/slice/syncThunks';
import type {Task} from '@features/tasks/types';
import {useAppDispatch} from '@store/hooks';
import {useAppNavigation} from '@navigation/hooks';
import {useTheme} from '@theme/ThemeProvider';

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
  const isOnline = useIsOnline();
  const {tasks, isLoading, errorMessage, refresh, toggleCompleted} =
    useTasksController();
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
      // Pull-to-refresh also nudges sync when online — never blocks offline use.
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
      toggleCompleted(taskId);
    },
    [toggleCompleted],
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

  const showInitialLoading = isLoading && !hasLoadedOnce && tasks.length === 0;

  return (
    <ScreenContainer>
      <ConnectivityStatusBar />
      <View style={styles.body}>
        {errorMessage ? (
          <View style={styles.errorWrap}>
            <FormErrorBanner
              message={errorMessage}
              accessibilityLabel="Tasks error"
            />
          </View>
        ) : null}

        {showInitialLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text
              style={[
                styles.loadingLabel,
                theme.typography.caption,
                {color: theme.colors.textSecondary},
              ]}>
              Loading your tasks…
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            removeClippedSubviews
            contentContainerStyle={
              tasks.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No tasks yet"
                description="Create a task anytime — even offline. Everything is saved on this device first."
                actionLabel="Create task"
                onActionPress={handleCreate}
              />
            }
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
  errorWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLabel: {
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});
