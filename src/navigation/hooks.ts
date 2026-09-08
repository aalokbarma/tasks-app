import {useNavigation, useRoute} from '@react-navigation/native';

import type {
  AppNavigationProp,
  AppNavigatorParamList,
  AppRouteProp,
  AuthNavigationProp,
  AuthNavigatorParamList,
  AuthRouteProp,
} from './types';

export function useAuthNavigation<
  RouteName extends keyof AuthNavigatorParamList = keyof AuthNavigatorParamList,
>() {
  return useNavigation<AuthNavigationProp<RouteName>>();
}

export function useAuthRoute<RouteName extends keyof AuthNavigatorParamList>() {
  return useRoute<AuthRouteProp<RouteName>>();
}

export function useAppNavigation<
  RouteName extends keyof AppNavigatorParamList = keyof AppNavigatorParamList,
>() {
  return useNavigation<AppNavigationProp<RouteName>>();
}

export function useAppRoute<RouteName extends keyof AppNavigatorParamList>() {
  return useRoute<AppRouteProp<RouteName>>();
}
