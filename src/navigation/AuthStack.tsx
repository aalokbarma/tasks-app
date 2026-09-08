import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {lazy, Suspense} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {AuthStackParamList} from './types';

const LoginScreen = lazy(() =>
  import('@features/auth/screens/LoginScreen').then(module => ({
    default: module.LoginScreen,
  })),
);

const SignUpScreen = lazy(() =>
  import('@features/auth/screens/SignUpScreen').then(module => ({
    default: module.SignUpScreen,
  })),
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

function LazyFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator />
    </View>
  );
}

export function AuthStack() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
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
