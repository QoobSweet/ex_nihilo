import request from 'supertest';
import app from '../../src/server';

describe('Access Control', () => {
  it('should deny access without authentication', async () => {
    const res = await request(app).get('/api/workflows');
    expect(res.status).toBe(401);
  });

  it('should deny access for unauthorized user', async () => {
    // Mock auth token for different user
    const res = await request(app)
      .get('/api/workflows?userId=2')
      .set('Authorization', 'Bearer mockTokenForUser1');
    expect(res.status).toBe(403);
  });
});