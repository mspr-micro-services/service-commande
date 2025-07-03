import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/index.js'; // ou le bon chemin vers ton app Express

jest.mock('../src/middlewares/kafkaEvenementCommande.js', () => ({
  kafkaEvenementCommande: () => (req, res, next) => next()
}));

describe('API Commandes', () => {
  let token;
  let idCommande;

  beforeAll(async () => {
    // Génère un token JWT valide ici ou utilise un token statique
    token = 'Bearer <ton_token_jwt>';
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('POST /commandes - doit créer une commande', async () => {
    const res = await request(app)
      .post('/commandes')
      .set('Authorization', token)
      .send({
        clientId: 'test-client',
        produits: [{ produitId: 'prod-1', quantite: 1, prixUnitaire: 5 }],
        total: 5
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    idCommande = res.body._id;
  });

  it('GET /commandes/:id - doit retourner la commande créée', async () => {
    const res = await request(app)
      .get(`/commandes/${idCommande}`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('clientId', 'test-client');
  });

  it('PUT /commandes/:id - doit modifier la commande', async () => {
    const res = await request(app)
      .put(`/commandes/${idCommande}`)
      .set('Authorization', token)
      .send({
        statut: 'payée',
        total: 10
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('statut', 'payée');
    expect(res.body).toHaveProperty('total', 10);
  });

  it('DELETE /commandes/:id - doit supprimer la commande', async () => {
    const res = await request(app)
      .delete(`/commandes/${idCommande}`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Commande supprimée');
  });
});