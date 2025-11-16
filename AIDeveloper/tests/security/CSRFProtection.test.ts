import request from 'supertest';
import app from '../../src/server';

describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const res = await request(app)
      .put('/api/workflows/1')
      .set('Authorization', 'Bearer validToken')
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
  });

  it('should accept requests with valid CSRF token', async () => {
    // Mock cookie and body token
    const res = await request(app)
      .put('/api/workflows/1')
      .set('Authorization', 'Bearer validToken')
      .set('Cookie', '_csrf=validCsrfToken')
      .send({ _csrf: 'validCsrfToken', name: 'Updated' });
    // Assuming auth passes, check CSRF
    expect(res.status).not.toBe(403);
  });
});