import { jest } from '@jest/globals';
import * as controller from '../../src/controllers/commandeController.js';
import Commande from '../../src/models/commande.js';

describe('Contrôleur Commande', () => {
  afterEach(() => jest.restoreAllMocks());

  it('creerCommande doit enregistrer et retourner la commande', async () => {
    jest.spyOn(Commande.prototype, 'save').mockResolvedValue({ _id: 'id', clientId: '1', produits: [], total: 10 });
    const req = { body: { clientId: '1', produits: [], total: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.creerCommande(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: 'id', clientId: '1', produits: [], total: 10 });
    expect(res.locals.commande).toEqual({ _id: 'id', clientId: '1', produits: [], total: 10 });
    expect(next).toHaveBeenCalled();
  });

  it('creerCommande doit gérer une erreur et retourner un code 400', async () => {
    jest.spyOn(Commande.prototype, 'save').mockRejectedValue(new Error('Erreur création'));
    const req = { body: { clientId: '1', produits: [], total: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.creerCommande(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erreur création' });
    expect(next).not.toHaveBeenCalled();
  });

  it('lireToutesCommandes doit retourner toutes les commandes', async () => {
    const commandesMock = [
      { _id: '1', clientId: '1', produits: [], total: 10 },
      { _id: '2', clientId: '2', produits: [], total: 20 }
    ];
    Commande.find = jest.fn().mockResolvedValue(commandesMock);
    const req = {};
    const res = { json: jest.fn() };
    await controller.lireToutesCommandes(req, res);
    expect(Commande.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(commandesMock);
  });

  it('lireToutesCommandes doit gérer une erreur et retourner un code 500', async () => {
    Commande.find = jest.fn().mockRejectedValue(new Error('Erreur DB'));
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await controller.lireToutesCommandes(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erreur DB' });
  });

  it('lireCommandeParId doit retourner la commande demandée', async () => {
    const commandeMock = { _id: '1', clientId: '1', produits: [], total: 10 };
    Commande.findById = jest.fn().mockResolvedValue(commandeMock);
    const req = { params: { id: '1' } };
    const res = { json: jest.fn() };
    await controller.lireCommandeParId(req, res);
    expect(Commande.findById).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith(commandeMock);
  });

  it('lireCommandeParId doit retourner 404 si la commande est absente', async () => {
    Commande.findById = jest.fn().mockResolvedValue(null);
    const req = { params: { id: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await controller.lireCommandeParId(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Commande non trouvée' });
  });

  it('modifierCommande doit modifier et retourner la commande', async () => {
    const commandeModifiee = { _id: '1', clientId: '1', produits: [], total: 20 };
    Commande.findByIdAndUpdate = jest.fn().mockResolvedValue(commandeModifiee);
    const req = { params: { id: '1' }, body: { total: 20 } };
    const res = { json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.modifierCommande(req, res, next);
    expect(Commande.findByIdAndUpdate).toHaveBeenCalledWith('1', { total: 20 }, { new: true });
    expect(res.json).toHaveBeenCalledWith(commandeModifiee);
    expect(res.locals.commande).toBe(commandeModifiee);
    expect(next).toHaveBeenCalled();
  });

  it('modifierCommande doit retourner 404 si la commande est absente', async () => {
    Commande.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    const req = { params: { id: '1' }, body: { total: 20 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.modifierCommande(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Commande non trouvée' });
    expect(next).not.toHaveBeenCalled();
  });

  it('supprimerCommande doit supprimer et retourner la commande', async () => {
    const commandeSupprimee = { _id: '1', clientId: '1', produits: [], total: 10 };
    Commande.findByIdAndDelete = jest.fn().mockResolvedValue(commandeSupprimee);
    const req = { params: { id: '1' } };
    const res = { json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.supprimerCommande(req, res, next);
    expect(Commande.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ message: 'Commande supprimée' });
    expect(res.locals.commande).toBe(commandeSupprimee);
    expect(next).toHaveBeenCalled();
  });

  it('supprimerCommande doit retourner 404 si la commande est absente', async () => {
    Commande.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    const req = { params: { id: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };
    const next = jest.fn();
    await controller.supprimerCommande(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Commande non trouvée' });
    expect(next).not.toHaveBeenCalled();
  });
});
