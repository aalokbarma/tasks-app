import type {NavigatorScreenParams, RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';

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
 * Logical root switcher (Splash | Auth | App). Not a real navigator —
 * RootNavigator mounts one of these trees directly under NavigationContainer.
 */
export type RootNavigatorParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthNavigatorParamList>;
  App: NavigatorScreenParams<AppNavigatorParamList>;
};

export type AuthNavigationProp<
  RouteName extends keyof AuthNavigatorParamList = keyof AuthNavigatorParamList,
> = StackNavigationProp<AuthNavigatorParamList, RouteName>;

export type AppNavigationProp<
  RouteName extends keyof AppNavigatorParamList = keyof AppNavigatorParamList,
> = StackNavigationProp<AppNavigatorParamList, RouteName>;

export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = keyof RootNavigatorParamList,
> = StackNavigationProp<RootNavigatorParamList, RouteName>;

export type AuthRouteProp<RouteName extends keyof AuthNavigatorParamList> =
  RouteProp<AuthNavigatorParamList, RouteName>;

export type AppRouteProp<RouteName extends keyof AppNavigatorParamList> =
  RouteProp<AppNavigatorParamList, RouteName>;

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;

declare global {
  namespace ReactNavigation {
    // Active top-level navigator is App or Auth depending on session.
    interface RootParamList extends AppNavigatorParamList {}
  }
}

export {};
