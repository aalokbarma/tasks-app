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
 * Settings remains available for account/logout without belonging to task CRUD.
 */
export type AppNavigatorParamList = {
  TaskList: undefined;
  TaskDetails: {taskId: UniqueId};
  CreateTask: undefined;
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

/** @deprecated Use AuthNavigatorParamList */
export type AuthStackParamList = AuthNavigatorParamList;
/** @deprecated Use AppNavigatorParamList */
export type AppStackParamList = AppNavigatorParamList;
/** @deprecated Use RootNavigatorParamList */
export type RootStackParamList = RootNavigatorParamList;
/** @deprecated Use AuthNavigationProp */
export type AuthStackNavigationProp<
  RouteName extends keyof AuthNavigatorParamList,
> = AuthNavigationProp<RouteName>;
/** @deprecated Use AppNavigationProp */
export type AppStackNavigationProp<
  RouteName extends keyof AppNavigatorParamList,
> = AppNavigationProp<RouteName>;
/** @deprecated Use AppRouteProp */
export type AppStackRouteProp<RouteName extends keyof AppNavigatorParamList> =
  AppRouteProp<RouteName>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParamList {}
  }
}

export {};
