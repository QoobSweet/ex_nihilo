import jwt from 'jsonwebtoken';

/**
 * Authentication Helper for JWT-based auth.
 *
 * @security Handles secure token storage and validation
 */
export const authHelper = {
  /**
   * Retrieves the JWT token from localStorage.
   *
   * @returns {string|null} The token or null if not found
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  /**
   * Stores the JWT token securely.
   *
   * @param {string} token - The JWT token
   */
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  /**
   * Validates the token (basic check).
   *
   * @param {string} token - The token to validate
   * @returns {boolean} True if valid
   */
  isValidToken: (token: string): boolean => {
    try {
      jwt.verify(token, process.env.REACT_APP_JWT_SECRET || 'fallback');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Logs out by removing the token.
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
  }
};