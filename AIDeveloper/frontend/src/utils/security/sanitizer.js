import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML input to prevent XSS attacks.
 *
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 *
 * @security Uses DOMPurify to remove malicious scripts and tags
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }); // Strip all HTML for safety
};

/**
 * Validates and sanitizes user input for API calls.
 *
 * @param {any} input - Input to validate
 * @param {string} type - Expected type ('string', 'number', etc.)
 * @returns {any} - Sanitized input or throws error
 */
export const validateAndSanitize = (input, type) => {
  switch (type) {
    case 'string':
      if (typeof input !== 'string') throw new Error('Invalid input type');
      return sanitizeHtml(input);
    case 'number':
      const num = Number(input);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    default:
      throw new Error('Unsupported type');
  }
};