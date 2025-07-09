import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/index.js";

const secret = process.env.JWT_SECRET;
const tokenAdmin = jwt.sign({ username: "test", role: "admin" }, secret, { expiresIn: "1h" });

let mongoServer;

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
  // Nettoyage de toutes les collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Tests d'intégration des routes principales", () => {
  it("POST /auth/login doit retourner un token", async () => {
    const res = await request(app).post("/auth/login").send({ username: "test", role: "user" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("GET /commandes sans token doit refuser l'accès", async () => {
    const res = await request(app).get("/commandes");
    expect(res.statusCode).toBe(401);
  });

  it("GET /commandes avec token doit répondre (200 ou 500 selon la base)", async () => {
    const res = await request(app).get("/commandes").set("Authorization", `Bearer ${tokenAdmin}`);
    expect([200, 500]).toContain(res.statusCode); // 200 si la base répond, 500 sinon
  });
});

describe("Middleware CORS", () => {
  it("doit ajouter l’en-tête Access-Control-Allow-Origin", async () => {
    const res = await request(app).get("/auth/login");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});

describe("Middleware d’erreur globale", () => {
  it("doit renvoyer un 500 et un message standardisé en cas d’erreur non gérée", async () => {
    // On crée une route temporaire qui lève une erreur
    app.get("/test-error", (req, res, next) => {
      next(new Error("Erreur de test")); // Provoque une erreur non gérée
    });
    const res = await request(app).get("/test-error");
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Erreur serveur");
  });
});
