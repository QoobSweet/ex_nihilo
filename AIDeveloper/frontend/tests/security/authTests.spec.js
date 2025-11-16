import { authHelper } from '../../src/utils/auth/authHelper';

describe('Authentication Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('stores and retrieves token', () => {
    const token = 'fake.jwt.token';
    authHelper.setToken(token);
    expect(authHelper.getToken()).toBe(token);
  });

  test('validates valid token', () => {
    // Mock a valid token
    const token = jwt.sign({ userId: 1 }, 'secret');
    expect(authHelper.isValidToken(token)).toBe(true);
  });

  test('invalidates invalid token', () => {
    const token = 'invalid.token';
    expect(authHelper.isValidToken(token)).toBe(false);
  });
});