import type {
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {UniqueId} from '@app-types/common';

/**
 * Auth flow — only mounted while the user is signed out (or auth errored).
 */
export type AuthNavigatorParamList = {
  Login: undefined;
  Signup: undefined;
};

/**
 * Authenticated app flow — only mounted while signed in.
 */
export type AppNavigatorParamList = {
  TaskList: undefined;
  TaskDetails: {taskId: UniqueId};
  CreateTask: undefined;
  EditTask: {taskId: UniqueId};
  Settings: undefined;
};

/**
 * Root switcher driven by authentication status.
 * Exactly one of Splash | Auth | App is mounted at a time.
 */
export type RootNavigatorParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthNavigatorParamList>;
  App: NavigatorScreenParams<AppNavigatorParamList>;
};

export type AuthNavigationProp<
  RouteName extends keyof AuthNavigatorParamList = keyof AuthNavigatorParamList,
> = NativeStackNavigationProp<AuthNavigatorParamList, RouteName>;

export type AppNavigationProp<
  RouteName extends keyof AppNavigatorParamList = keyof AppNavigatorParamList,
> = NativeStackNavigationProp<AppNavigatorParamList, RouteName>;

export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = keyof RootNavigatorParamList,
> = NativeStackNavigationProp<RootNavigatorParamList, RouteName>;

export type AuthRouteProp<RouteName extends keyof AuthNavigatorParamList> =
  RouteProp<AuthNavigatorParamList, RouteName>;

export type AppRouteProp<RouteName extends keyof AppNavigatorParamList> =
  RouteProp<AppNavigatorParamList, RouteName>;

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParamList {}
  }
}

export {};
