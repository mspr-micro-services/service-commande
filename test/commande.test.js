// src/__tests__/commande.test.js
import request from 'supertest';
import app from '../index.js'; // ton app Express exporté dans index.js
import mongoose from 'mongoose';

let token;

beforeAll(async () => {
  // Mock d'un token JWT valide
  token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /commandes', () => {
  it('devrait créer une commande avec token valide', async () => {
    const res = await request(app)
      .post('/commandes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: 'clientTest',
        produits: [
          { produitId: 'prod1', quantite: 2, prixUnitaire: 10 }
        ],
        total: 20,
        statut: 'en_attente'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.clientId).toBe('clientTest');
  });

  it('devrait refuser la création sans token', async () => {
    const res = await request(app)
      .post('/commandes')
      .send({
        clientId: 'clientTest',
        produits: [
          { produitId: 'prod1', quantite: 2, prixUnitaire: 10 }
        ],
        total: 20,
        statut: 'en_attente'
      });

    expect(res.statusCode).toEqual(401);
  });
});
