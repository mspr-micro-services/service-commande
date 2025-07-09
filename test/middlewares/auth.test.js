import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middlewares/auth.js';

describe('Middleware authenticateToken', () => {
  const secret = process.env.JWT_SECRET || 'supersecret';
  const user = { username: 'test', role: 'admin' };
  const token = jwt.sign(user, secret);

  it('doit refuser si pas de header', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('doit refuser si token mal formaté', () => {
    const req = { headers: { authorization: 'Bearer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('doit refuser si token invalide', () => {
    const req = { headers: { authorization: 'Bearer fake' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('doit passer si token valide', () => {
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(user);
  });
});