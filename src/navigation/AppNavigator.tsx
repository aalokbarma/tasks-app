import {HeaderTextButton} from '@components/ui/HeaderTextButton';
import {lazy, Suspense, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View} from 'react-native';

import {TaskListScreen} from '@features/tasks/screens/TaskListScreen';
import {useTheme} from '@theme/ThemeProvider';

import {LazyScreenFallback} from './LazyScreenFallback';
import {createDefaultStackOptions} from './screenOptions';
import type {AppNavigationProp, AppNavigatorParamList} from './types';

// Home list is eager for faster first paint; secondary screens stay lazy.
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

const EditTaskScreen = lazy(() =>
  import('@features/tasks/screens/EditTaskScreen').then(module => ({
    default: module.EditTaskScreen,
  })),
);

const SettingsScreen = lazy(() =>
  import('@features/settings/screens/SettingsScreen').then(module => ({
    default: module.SettingsScreen,
  })),
);

const Stack = createNativeStackNavigator<AppNavigatorParamList>();

function TaskListHeaderRight() {
  const navigation = useNavigation<AppNavigationProp<'TaskList'>>();

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
      <HeaderTextButton
        label="New"
        prominence="strong"
        accessibilityLabel="Create task"
        onPress={() => navigation.navigate('CreateTask')}
      />
      <HeaderTextButton
        label="Account"
        accessibilityLabel="Open account settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
}

/**
 * Authenticated flow. Unmounted entirely when the user is signed out,
 * so unauthenticated users cannot access task screens.
 */
export function AppNavigator() {
  const {theme} = useTheme();
  const screenOptions = useMemo(
    () => createDefaultStackOptions(theme),
    [theme],
  );

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
          name="EditTask"
          component={EditTaskScreen}
          options={{
            title: 'Edit task',
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
