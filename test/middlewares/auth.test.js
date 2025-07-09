import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "supersecret";

beforeAll(() => {
  jest.resetModules();
});

import { authenticateToken, authorizeRole } from "../../src/middlewares/auth.js";

describe("Middleware authenticateToken", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  /**
   * Génère un token JWT pour les tests.
   * @param {object} payload
   * @param {string} secret
   * @returns {string}
   */
  function getToken(payload, secret = process.env.JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
  }

  it("doit refuser si pas de header d'autorisation", () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token manquant" });
    expect(next).not.toHaveBeenCalled(); // next ne doit pas être appelé en cas d'erreur
  });

  it("doit refuser si le header ne commence pas par 'Bearer '", () => {
    const req = { headers: { authorization: "Token abcdef" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token mal formaté" });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit refuser si le token est mal formaté (pas de valeur après 'Bearer ')", () => {
    const req = { headers: { authorization: "Bearer " } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token mal formaté" });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit refuser si le token est invalide (signature incorrecte)", () => {
    const fakeToken = getToken({ id: "user1", username: "user", role: "admin" }, "wrongsecret");
    const req = { headers: { authorization: `Bearer ${fakeToken}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    // Avance les timers pour que le callback de jwt.verify soit appelé
    jest.runAllTimers();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide" });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit refuser si le token est valide mais sans le champ 'role'", () => {
    const token = getToken({ id: "user1", username: "user" }); // Pas de rôle ici
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    jest.runAllTimers();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide (payload)" });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit passer si token valide (admin)", (done) => {
    jest.resetModules();
    import("../../src/middlewares/auth.js").then(({ authenticateToken }) => {
      const token = getToken({ id: "user1", username: "user", role: "admin" });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = () => {
        try {
          expect(req.user).toMatchObject({ id: "user1", username: "user", role: "admin" });
          done();
        } catch (e) {
          done(e);
        }
      };
      authenticateToken(req, res, next);
    });
  });

  it("doit passer si token valide (revendeurs)", (done) => {
    jest.resetModules();
    import("../../src/middlewares/auth.js").then(({ authenticateToken }) => {
      const token = getToken({ id: "user2", username: "revendeur", role: "revendeurs" });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = () => {
        try {
          expect(req.user).toMatchObject({ id: "user2", username: "revendeur", role: "revendeurs" });
          done();
        } catch (e) {
          done(e);
        }
      };
      authenticateToken(req, res, next);
    });
  });

  it("doit passer si token valide (client)", (done) => {
    jest.resetModules();
    import("../../src/middlewares/auth.js").then(({ authenticateToken }) => {
      const token = getToken({ id: "user3", username: "client", role: "client" });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = () => {
        try {
          expect(req.user).toMatchObject({ id: "user3", username: "client", role: "client" });
          done();
        } catch (e) {
          done(e);
        }
      };
      authenticateToken(req, res, next);
    });
  });

  it("doit passer si token valide (webshop)", (done) => {
    jest.resetModules();
    import("../../src/middlewares/auth.js").then(({ authenticateToken }) => {
      const token = getToken({ id: "user4", username: "webshop", role: "webshop" });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = () => {
        try {
          expect(req.user).toMatchObject({ id: "user4", username: "webshop", role: "webshop" });
          done();
        } catch (e) {
          done(e);
        }
      };
      authenticateToken(req, res, next);
    });
  });
});

describe("Middleware authorizeRole", () => {
  it("doit refuser si req.user n'est pas défini", () => {
    const req = {}; // Pas de req.user
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeAdmin = authorizeRole("admin");

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès interdit : rôle insuffisant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit refuser si le rôle de l'utilisateur n'est pas autorisé (rôle unique)", () => {
    const req = { user: { id: "user1", role: "client" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeAdmin = authorizeRole("admin");

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès interdit : rôle insuffisant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit refuser si le rôle de l'utilisateur n'est pas autorisé (liste de rôles)", () => {
    const req = { user: { id: "user1", role: "client" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeAdminOrReseller = authorizeRole(["admin", "revendeurs"]);

    authorizeAdminOrReseller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès interdit : rôle insuffisant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit passer si le rôle de l'utilisateur est autorisé (rôle unique)", () => {
    const req = { user: { id: "user1", role: "admin" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeAdmin = authorizeRole("admin");

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1); // next doit être appelé une fois
    expect(res.status).not.toHaveBeenCalled(); // Aucun statut d'erreur ne doit être appelé
    expect(res.json).not.toHaveBeenCalled(); // Aucune réponse JSON d'erreur ne doit être appelée
  });

  it("doit passer si le rôle de l'utilisateur est autorisé (liste de rôles)", () => {
    const req = { user: { id: "user1", role: "revendeurs" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeAdminOrReseller = authorizeRole(["admin", "revendeurs"]);

    authorizeAdminOrReseller(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("doit passer si le rôle de l'utilisateur est le premier de la liste autorisée", () => {
    const req = { user: { id: "user1", role: "admin" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeRoles = authorizeRole(["admin", "client", "webshop"]);

    authorizeRoles(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("doit passer si le rôle de l'utilisateur est au milieu de la liste autorisée", () => {
    const req = { user: { id: "user1", role: "client" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeRoles = authorizeRole(["admin", "client", "webshop"]);

    authorizeRoles(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("doit passer si le rôle de l'utilisateur est le dernier de la liste autorisée", () => {
    const req = { user: { id: "user1", role: "webshop" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const authorizeRoles = authorizeRole(["admin", "client", "webshop"]);

    authorizeRoles(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
