import { sanitizeHtml } from '../../src/utils/security/sanitizer';

describe('XSS Prevention Tests', () => {
  test('sanitizes script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const output = sanitizeHtml(input);
    expect(output).toBe('Hello');
  });

  test('sanitizes event handlers', () => {
    const input = '<div onclick="alert(1)">Click</div>';
    const output = sanitizeHtml(input);
    expect(output).toBe('Click');
  });

  test('handles normal text', () => {
    const input = 'Normal text';
    const output = sanitizeHtml(input);
    expect(output).toBe('Normal text');
  });
});