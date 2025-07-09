import request from 'supertest';
import app from '../src/index.js';

describe("POST /auth/login", () => {
  it("doit retourner un token JWT avec des bonnes données", async () => {
    const res = await request(app).post("/auth/login").send({ username: "alice", role: "admin" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it("doit refuser une requête sans username", async () => {
    const res = await request(app).post("/auth/login").send({ role: "revendeurs" });

    expect(res.statusCode).toEqual(400);
  });
});
