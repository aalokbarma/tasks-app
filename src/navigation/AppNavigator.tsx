import {HeaderTextButton} from '@components/ui/HeaderTextButton';
import {useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, View} from 'react-native';

import {SettingsScreen} from '@features/settings/screens/SettingsScreen';
import {CreateTaskScreen} from '@features/tasks/screens/CreateTaskScreen';
import {EditTaskScreen} from '@features/tasks/screens/EditTaskScreen';
import {TaskDetailsScreen} from '@features/tasks/screens/TaskDetailsScreen';
import {TaskListScreen} from '@features/tasks/screens/TaskListScreen';
import {useTheme} from '@theme/ThemeProvider';

import {createDefaultStackOptions} from './screenOptions';
import type {AppNavigationProp, AppNavigatorParamList} from './types';

const Stack = createNativeStackNavigator<AppNavigatorParamList>();

/**
 * Authenticated flow. Unmounted entirely when the user is signed out,
 * so unauthenticated users cannot access task screens.
 *
 * Screens are eager: React.lazy + Suspense under native-stack (Fabric)
 * remounts the screen subtree asynchronously and can crash with
 * `addViewAt: failed to insert view … Index: N, Size: M`.
 */
export function AppNavigator() {
  const {theme} = useTheme();
  const screenOptions = useMemo(
    () => createDefaultStackOptions(theme),
    [theme],
  );

  return (
    <Stack.Navigator initialRouteName="TaskList" screenOptions={screenOptions}>
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={({navigation}: {navigation: AppNavigationProp<'TaskList'>}) => ({
          title: 'Tasks',
          headerRight: () => (
            <View style={styles.headerActions}>
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
          ),
        })}
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
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
