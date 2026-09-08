import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {lazy, Suspense} from 'react';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useTheme} from '@theme/ThemeProvider';

import type {AppStackNavigationProp, AppStackParamList} from './types';

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

function TaskListSettingsButton() {
  const navigation = useNavigation<AppStackNavigationProp<'TaskList'>>();
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

export function AppStack() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Stack.Navigator>
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{
            title: 'Tasks',
            headerRight: TaskListSettingsButton,
          }}
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
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerButtonLabel: {
    fontWeight: '600',
  },
});
