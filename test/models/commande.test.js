import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/index.js';
import Commande from '../../src/models/commande.js';

const secret = process.env.JWT_SECRET;
const token = jwt.sign({ username: 'test', role: 'user' }, secret, { expiresIn: '1h' });

let mongoServer;

describe('API Commandes', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Commande.deleteMany();
  });

  it('POST /commandes doit créer une commande', async () => {
    const commande = { clientId: '1', produits: [], total: 10 };
    const res = await request(app)
      .post('/commandes')
      .set('Authorization', `Bearer ${token}`)
      .send(commande);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject(commande);
  });

  it('GET /commandes doit retourner toutes les commandes', async () => {
    await Commande.create({ clientId: '1', produits: [], total: 10 });
    await Commande.create({ clientId: '2', produits: [], total: 20 });
    const res = await request(app)
      .get('/commandes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /commandes/:id doit retourner la commande demandée', async () => {
    const commande = await Commande.create({ clientId: '1', produits: [], total: 10 });
    const res = await request(app)
      .get(`/commandes/${commande._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.clientId).toBe('1');
  });

  it('PUT /commandes/:id doit modifier la commande', async () => {
    const commande = await Commande.create({ clientId: '1', produits: [], total: 10 });
    const res = await request(app)
      .put(`/commandes/${commande._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ total: 20 });
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(20);
  });

  it('DELETE /commandes/:id doit supprimer la commande', async () => {
    const commande = await Commande.create({ clientId: '1', produits: [], total: 10 });
    const res = await request(app)
      .delete(`/commandes/${commande._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Commande supprimée');
  });

  it('GET /commandes sans token doit refuser l\'accès', async () => {
    const res = await request(app).get('/commandes');
    expect(res.statusCode).toBe(401);
  });
});