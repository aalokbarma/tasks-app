jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Manual mocks live under __mocks__/ — call without a factory so Jest
// resolves them once (a factory that re-requires the mock path can recurse).
jest.mock('@react-native-community/netinfo');
jest.mock('react-native-nitro-sqlite');
jest.mock('@notifee/react-native');

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    Directions: {},
    gestureHandlerRootHOC: jest.fn(component => component),
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    ScreenStack: View,
    SearchBar: View,
  };
});
