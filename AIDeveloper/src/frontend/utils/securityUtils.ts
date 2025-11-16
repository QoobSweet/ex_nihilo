import DOMPurify from 'dompurify';

/**
 * Sanitizes input to prevent XSS attacks.
 * Uses DOMPurify to clean HTML and scripts.
 *
 * @param input - The string to sanitize
 * @returns Sanitized string safe for rendering
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // Strip all HTML
};

/**
 * Validates if a string is a valid email.
 *
 * @param email - Email string to validate
 * @returns True if valid email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string meets basic requirements (no scripts, length).
 *
 * @param input - Input to validate
 * @param maxLength - Maximum allowed length
 * @returns True if valid
 */
export const validateInput = (input: string, maxLength: number = 255): boolean => {
  if (typeof input !== 'string' || input.length > maxLength) {
    return false;
  }
  // Check for basic script patterns
  const scriptRegex = /<script|javascript:|on\w+=/i;
  return !scriptRegex.test(input);
};