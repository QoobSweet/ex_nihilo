import { DOMPurify } from './middleware';

/**
 * Utility function to sanitize HTML content for safe rendering
 * Prevents XSS attacks
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content);
};

/**
 * Utility function to validate and sanitize user inputs using allowlist
 * @param input - The input string to validate and sanitize
 * @param pattern - RegExp pattern for allowlist validation
 * @returns Sanitized string or throws error if invalid
 */
export const validateAndSanitize = (input: string, pattern: RegExp): string => {
  if (!pattern.test(input)) {
    throw new Error('Invalid input');
  }
  return DOMPurify.sanitize(input);
};