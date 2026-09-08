import {Pressable, StyleSheet, Text} from 'react-native';
import {lazy, Suspense} from 'react';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useTheme} from '@theme/ThemeProvider';

import {LazyScreenFallback} from './LazyScreenFallback';
import {createDefaultStackOptions} from './screenOptions';
import type {AppNavigationProp, AppNavigatorParamList} from './types';

const TaskListScreen = lazy(() =>
  import('@features/tasks/screens/TaskListScreen').then(module => ({
    default: module.TaskListScreen,
  })),
);

const TaskDetailsScreen = lazy(() =>
  import('@features/tasks/screens/TaskDetailsScreen').then(module => ({
    default: module.TaskDetailsScreen,
  })),
);

const CreateTaskScreen = lazy(() =>
  import('@features/tasks/screens/CreateTaskScreen').then(module => ({
    default: module.CreateTaskScreen,
  })),
);

const SettingsScreen = lazy(() =>
  import('@features/settings/screens/SettingsScreen').then(module => ({
    default: module.SettingsScreen,
  })),
);

const Stack = createNativeStackNavigator<AppNavigatorParamList>();

function TaskListAccountButton() {
  const navigation = useNavigation<AppNavigationProp<'TaskList'>>();
  const {theme} = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open account settings"
      hitSlop={8}
      onPress={() => navigation.navigate('Settings')}
      style={styles.headerButton}>
      <Text
        style={[
          styles.headerButtonLabel,
          theme.typography.body,
          {color: theme.colors.primary},
        ]}>
        Account
      </Text>
    </Pressable>
  );
}

function TaskListCreateButton() {
  const navigation = useNavigation<AppNavigationProp<'TaskList'>>();
  const {theme} = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create task"
      hitSlop={8}
      onPress={() => navigation.navigate('CreateTask')}
      style={styles.headerButton}>
      <Text
        style={[
          styles.headerButtonLabel,
          theme.typography.body,
          {color: theme.colors.primary},
        ]}>
        New
      </Text>
    </Pressable>
  );
}

function TaskListHeaderRight() {
  return (
    <>
      <TaskListCreateButton />
      <TaskListAccountButton />
    </>
  );
}

/**
 * Authenticated flow. Unmounted entirely when the user is signed out,
 * so unauthenticated users cannot access TaskList / CreateTask / TaskDetails.
 */
export function AppNavigator() {
  const {theme} = useTheme();
  const screenOptions = createDefaultStackOptions(theme);

  return (
    <Suspense fallback={<LazyScreenFallback />}>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={screenOptions}>
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{
            title: 'Tasks',
            headerRight: TaskListHeaderRight,
          }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{
            title: 'Task',
            headerBackTitle: 'Tasks',
          }}
        />
        <Stack.Screen
          name="CreateTask"
          component={CreateTaskScreen}
          options={{
            title: 'New task',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Account',
          }}
        />
      </Stack.Navigator>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonLabel: {
    fontWeight: '600',
  },
});
