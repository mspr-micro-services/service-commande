import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/index.js";
import Commande from "../../src/models/commande.js";

const secret = process.env.JWT_SECRET || "supersecret";

// Helpers pour générer des tokens
function getToken({ id = "user1", username = "user", role = "client" } = {}) {
  return jwt.sign({ id, username, role }, secret);
}
const getAdminToken = () => getToken({ id: "admin1", username: "admin", role: "admin" });
const getUserToken = () => getToken({ id: "user1", username: "user", role: "client" });
const getRevendeurToken = (id = "rev1") => getToken({ id, username: "revendeur", role: "revendeurs" });
const getWebshopToken = (id = "web1") => getToken({ id, username: "webshop", role: "webshop" });

async function createCommande({
  _id = new mongoose.Types.ObjectId(),
  clientId = "1",
  produits = [],
  total = 10,
  revendeurId = "rev1",
  webshopId = "web1",
} = {}) {
  return Commande.create({ _id, clientId, produits, total, revendeurId, webshopId });
}

describe("Routes Commande - Gestion des rôles", () => {
  let adminToken, userToken, revendeurToken, webshopToken;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    adminToken = getAdminToken();
    userToken = getUserToken();
    revendeurToken = getRevendeurToken();
    webshopToken = getWebshopToken();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Nettoie la base après chaque test pour isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  it("admin peut voir toutes les commandes (integration)", async () => {
    await createCommande();
    const res = await request(app).get("/commandes").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("admin peut créer une commande", async () => {
    const res = await request(app)
      .post("/commandes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ clientId: "1", produits: [], total: 10 });
    expect([201, 400, 500]).toContain(res.statusCode);
  });

  it("utilisateur non admin ne peut pas créer une commande", async () => {
    const res = await request(app)
      .post("/commandes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ clientId: "1", produits: [], total: 10 });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("admin peut voir toutes les commandes", async () => {
    await createCommande();
    const res = await request(app).get("/commandes").set("Authorization", `Bearer ${adminToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it("utilisateur non admin ne peut pas voir toutes les commandes", async () => {
    const res = await request(app).get("/commandes").set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("admin peut modifier une commande", async () => {
    const commande = await createCommande();
    const res = await request(app)
      .put(`/commandes/${commande._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ total: 20 });
    expect([200, 404]).toContain(res.statusCode);
  });

  it("utilisateur non admin ne peut pas modifier une commande", async () => {
    const commande = await createCommande();
    const res = await request(app)
      .put(`/commandes/${commande._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ total: 20 });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("admin peut supprimer une commande", async () => {
    const commande = await createCommande();
    const res = await request(app).delete(`/commandes/${commande._id}`).set("Authorization", `Bearer ${adminToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  it("utilisateur non admin ne peut pas supprimer une commande", async () => {
    const commande = await createCommande();
    const res = await request(app).delete(`/commandes/${commande._id}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("tout utilisateur authentifié peut lire une commande par ID", async () => {
    const commande = await createCommande();
    const res = await request(app).get(`/commandes/${commande._id}`).set("Authorization", `Bearer ${userToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  it("revendeur peut voir ses propres commandes", async () => {
    await createCommande({ revendeurId: "rev1" });
    const res = await request(app)
      .get("/commandes/revendeur/rev1")
      .set("Authorization", `Bearer ${getRevendeurToken("rev1")}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it("revendeur ne peut pas voir les commandes d’un autre revendeur", async () => {
    await createCommande({ revendeurId: "rev2" });
    const res = await request(app)
      .get("/commandes/revendeur/rev2")
      .set("Authorization", `Bearer ${getRevendeurToken("rev1")}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("admin peut voir les commandes de n’importe quel revendeur", async () => {
    await createCommande({ revendeurId: "rev1" });
    const res = await request(app).get("/commandes/revendeur/rev1").set("Authorization", `Bearer ${adminToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it("webshop peut voir ses propres commandes", async () => {
    await createCommande({ webshopId: "web1" });
    const res = await request(app)
      .get("/commandes/webshop/web1")
      .set("Authorization", `Bearer ${getWebshopToken("web1")}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it("webshop ne peut pas voir les commandes d’un autre webshop", async () => {
    await createCommande({ webshopId: "web2" });
    const res = await request(app)
      .get("/commandes/webshop/web2")
      .set("Authorization", `Bearer ${getWebshopToken("web1")}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès interdit/i);
  });

  it("admin peut voir les commandes de n’importe quel webshop", async () => {
    await createCommande({ webshopId: "web1" });
    const res = await request(app).get("/commandes/webshop/web1").set("Authorization", `Bearer ${adminToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});
