module.exports = {
  AuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(async () => 'test-fcm-token'),
  onTokenRefresh: jest.fn(() => jest.fn()),
  requestPermission: jest.fn(async () => 1),
};
