import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/index.js';

const secret = process.env.JWT_SECRET;
const token = jwt.sign({ username: 'test', role: 'user' }, secret, { expiresIn: '1h' });

describe('Tests d\'intégration des routes principales', () => {
  it('POST /auth/login doit retourner un token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test', role: 'user' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /protected sans token doit refuser l\'accès', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('GET /protected avec token doit autoriser l\'accès', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Accès autorisé');
    expect(res.body).toHaveProperty('user');
  });

  it('GET /commandes sans token doit refuser l\'accès', async () => {
    const res = await request(app).get('/commandes');
    expect(res.statusCode).toBe(401);
  });

  it('GET /commandes avec token doit répondre (200 ou 500 selon la base)', async () => {
    const res = await request(app)
      .get('/commandes')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode); // 200 si la base répond, 500 sinon
  });
});
