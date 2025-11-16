import { sanitizeInput, validateEmail, validateInput } from '../utils/securityUtils';
import { secureApi } from '../services/secureApi';
import axios from 'axios';

describe('Security Utils', () => {
  test('sanitizeInput removes scripts', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    expect(sanitizeInput(malicious)).toBe('Hello');
  });

  test('validateEmail accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  test('validateInput rejects scripts and long inputs', () => {
    expect(validateInput('<script>')).toBe(false);
    expect(validateInput('a'.repeat(300))).toBe(false);
    expect(validateInput('valid')).toBe(true);
  });
});

describe('Secure API', () => {
  test('strips sensitive headers', async () => {
    // Mock response with sensitive header
    const mockResponse = {
      data: {},
      headers: { 'x-powered-by': 'Express', 'server': 'nginx' },
    };
    jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);

    const response = await secureApi.get('/test');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['server']).toBeUndefined();
  });

  test('handles 401 errors', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue({ response: { status: 401 } });
    await expect(secureApi.get('/test')).rejects.toThrow();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});