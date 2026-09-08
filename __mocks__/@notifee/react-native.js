module.exports = {
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
    getNotificationSettings: jest.fn(async () => ({authorizationStatus: 1})),
    createChannel: jest.fn(async () => 'task-reminders'),
    createTriggerNotification: jest.fn(async () => 'notification-id'),
    displayNotification: jest.fn(async () => 'notification-id'),
    cancelNotification: jest.fn(async () => undefined),
    cancelAllNotifications: jest.fn(async () => undefined),
  },
  AndroidImportance: {DEFAULT: 3, HIGH: 4},
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  TriggerType: {TIMESTAMP: 0, INTERVAL: 1},
};
