const request = require('supertest');
const app = require('./index');

describe('GET /', () => {
  it('doit répondre avec message OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Service Commande OK' });
  });
});
