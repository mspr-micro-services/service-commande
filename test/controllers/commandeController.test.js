import * as controller from '../../src/controllers/commandeController.js';
import Commande from '../../src/models/commande.js';

jest.mock('../src/models/commande.js');

describe('Contrôleur Commande', () => {
  afterEach(() => jest.clearAllMocks());

  it('créerCommande doit enregistrer et retourner la commande', async () => {
    const req = { body: { clientId: '1', produits: [], total: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), locals: {} };
    const next = jest.fn();
    Commande.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ _id: 'id', ...req.body })
    }));
    await controller.creerCommande(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ clientId: '1' }));
    expect(res.locals.commande).toBeDefined();
  });

  // Ajoute d'autres tests pour lireToutesCommandes, lireCommandeParId, modifierCommande, supprimerCommande
});