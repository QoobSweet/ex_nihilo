import { sanitizeHtml } from '../../src/security/sanitizationUtils';

describe('XSS Protection', () => {
  it('should sanitize malicious HTML', () => {
    const malicious = '<script>alert("xss")</script><p>Hello</p>';
    const sanitized = sanitizeHtml(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Hello</p>');
  });

  it('should allow safe HTML', () => {
    const safe = '<p>Safe content</p>';
    const sanitized = sanitizeHtml(safe);
    expect(sanitized).toBe(safe);
  });
});