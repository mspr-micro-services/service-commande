import request from 'supertest';
import app from '../src/index.js';
import jwt from 'jsonwebtoken';

describe('Route /protected', () => {
  const secret = process.env.JWT_SECRET || 'supersecret';
  const token = jwt.sign({ username: 'test', role: 'admin' }, secret);

  it('doit refuser sans token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('doit autoriser avec un token valide', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
  });
});