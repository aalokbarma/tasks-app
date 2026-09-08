module.exports = {
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  FieldValue: {
    arrayUnion: jest.fn((...args) => ({_type: 'arrayUnion', args})),
  },
};
