const createResult = (rows = []) => ({
  rowsAffected: rows.length,
  rows: {
    _array: rows,
    length: rows.length,
    item: (idx) => rows[idx],
  },
  results: rows,
});

const createConnection = () => {
  const connection = {
    close: jest.fn(),
    delete: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
    execute: jest.fn(() => createResult()),
    executeAsync: jest.fn(async () => createResult()),
    executeBatch: jest.fn(() => ({rowsAffected: 0})),
    executeBatchAsync: jest.fn(async () => ({rowsAffected: 0})),
    loadFile: jest.fn(),
    loadFileAsync: jest.fn(),
    transaction: jest.fn(async callback => {
      const tx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        execute: connection.execute,
        executeAsync: connection.executeAsync,
      };
      return callback(tx);
    }),
  };

  return connection;
};

module.exports = {
  open: jest.fn(() => createConnection()),
  NitroSQLiteError: class NitroSQLiteError extends Error {},
};
