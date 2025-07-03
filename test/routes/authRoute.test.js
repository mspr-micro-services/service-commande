import request from 'supertest';
import app from '../../src/index.js';

describe('Route /auth/login', () => {
  it('doit générer un token JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test', role: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('doit refuser si champs manquants', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test' });
    expect(res.statusCode).toBe(400);
  });
});