const currentUser = null;

const authInstance = {
  currentUser,
};

module.exports = {
  getAuth: jest.fn(() => authInstance),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  updateProfile: jest.fn(),
};
