module.exports = {
  getApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {projectId: 'example-project'},
  })),
  getApps: jest.fn(() => []),
};
