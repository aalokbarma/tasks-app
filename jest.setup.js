jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Manual mocks live under __mocks__/ — call without a factory so Jest
// resolves them once (a factory that re-requires the mock path can recurse).
jest.mock('@react-native-community/netinfo');
jest.mock('react-native-nitro-sqlite');
