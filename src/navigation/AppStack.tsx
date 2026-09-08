import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {lazy, Suspense} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {AppStackParamList} from './types';

const TaskListScreen = lazy(() =>
  import('@features/tasks/screens/TaskListScreen').then(module => ({
    default: module.TaskListScreen,
  })),
);

const TaskFormScreen = lazy(() =>
  import('@features/tasks/screens/TaskFormScreen').then(module => ({
    default: module.TaskFormScreen,
  })),
);

const SettingsScreen = lazy(() =>
  import('@features/settings/screens/SettingsScreen').then(module => ({
    default: module.SettingsScreen,
  })),
);

const Stack = createNativeStackNavigator<AppStackParamList>();

function LazyFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator />
    </View>
  );
}

export function AppStack() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Stack.Navigator>
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{title: 'Tasks'}}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={{title: 'Task'}}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Stack.Navigator>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
