import { jest } from '@jest/globals';

/**
 * Tests du middleware Kafka pour les événements de commandes
 * 
 * Ce test vérifie que :
 * - Les événements sont envoyés avec les bonnes données
 * - Les erreurs sont gérées gracieusement
 * - Le flux Express n'est pas interrompu
 * - Les performances sont acceptables
 * - La sécurité est respectée
 * 
 * @see {@link kafkaEvenementCommande}
 */
describe('Middleware kafkaEvenementCommande', () => {
  let mockNext, mockReq, mockRes;
  let kafkaEvenementCommande;
  let envoyerEvenementCommande;

  beforeAll(async () => {
    await jest.unstable_mockModule('../../src/kafka/producer.js', () => ({
      envoyerEvenementCommande: jest.fn()
    }));

    const producerModule = await import('../../src/kafka/producer.js');
    const middlewareModule = await import('../../src/middlewares/kafkaEvenementCommande.js');
    
    envoyerEvenementCommande = producerModule.envoyerEvenementCommande;
    kafkaEvenementCommande = middlewareModule.kafkaEvenementCommande;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
    mockReq = {};
    mockRes = { locals: {} };
  });

  describe('Validation des entrées', () => {
    it('doit rejeter un typeEvenement vide', () => {
      expect(() => kafkaEvenementCommande('')).toThrow('typeEvenement doit être une chaîne non vide');
    });

    it('doit rejeter un typeEvenement null', () => {
      expect(() => kafkaEvenementCommande(null)).toThrow('typeEvenement doit être une chaîne non vide');
    });

    it('doit rejeter un typeEvenement undefined', () => {
      expect(() => kafkaEvenementCommande(undefined)).toThrow('typeEvenement doit être une chaîne non vide');
    });

    it('doit accepter des types d\'événements valides', () => {
      const validTypes = ['cree', 'modifie', 'supprime', 'valide', 'annule'];
      for (const type of validTypes) {
        const middleware = kafkaEvenementCommande(type);
        expect(typeof middleware).toBe('function');
        expect(middleware.length).toBe(3);
      }
    });
  });

  describe('Comportement normal', () => {
    it('doit appeler envoyerEvenementCommande avec les bons arguments', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      expect(envoyerEvenementCommande).toHaveBeenCalledWith(
        'commandes',
        expect.objectContaining({
          evenement: 'cree',
          commande,
          date: expect.any(String)
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit inclure un timestamp ISO valide', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      const callArgs = envoyerEvenementCommande.mock.calls[0][1];
      expect(callArgs.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(callArgs.date).getTime()).toBeGreaterThan(0);
    });

    it('doit fonctionner avec des objets commande complexes', async () => {
      const commandeComplexe = {
        id: '123',
        produits: [
          { id: 'prod1', nom: 'Produit 1', prix: 50, quantite: 2 },
          { id: 'prod2', nom: 'Produit 2', prix: 25, quantite: 1 }
        ],
        total: 125,
        statut: 'en_cours',
        dateCreation: new Date().toISOString()
      };
      mockRes.locals.commande = commandeComplexe;
      envoyerEvenementCommande.mockResolvedValue();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      expect(envoyerEvenementCommande).toHaveBeenCalledWith(
        'commandes',
        expect.objectContaining({ 
          evenement: 'cree', 
          commande: commandeComplexe 
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit préserver les propriétés existantes de res.locals', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals = {
        commande,
        user: { id: 'user1', role: 'admin' },
        session: { id: 'session1' }
      };
      envoyerEvenementCommande.mockResolvedValue();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      expect(mockRes.locals.user).toEqual({ id: 'user1', role: 'admin' });
      expect(mockRes.locals.session).toEqual({ id: 'session1' });
      expect(mockRes.locals.commande).toEqual(commande);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Gestion des cas d\'erreur', () => {
    it('ne doit pas appeler envoyerEvenementCommande si res.locals.commande est absent', async () => {
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      expect(envoyerEvenementCommande).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('ne doit pas appeler envoyerEvenementCommande si res.locals.commande est null', async () => {
      mockRes.locals.commande = null;
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      expect(envoyerEvenementCommande).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('ne doit pas appeler envoyerEvenementCommande si res.locals.commande est undefined', async () => {
      mockRes.locals.commande = undefined;
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      expect(envoyerEvenementCommande).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit gérer les erreurs Kafka et continuer le flux', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      const kafkaError = new Error('Erreur de connexion Kafka');
      envoyerEvenementCommande.mockRejectedValue(kafkaError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      expect(envoyerEvenementCommande).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Erreur envoi Kafka:', {
        message: 'Erreur de connexion Kafka',
        name: 'Error',
        stack: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('doit gérer les erreurs Kafka et appeler next() même en cas d\'échec', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockRejectedValue(new Error('Kafka indisponible'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('Sécurité', () => {
    it('ne doit pas exposer d\'informations sensibles dans les logs', async () => {
      const commande = { 
        id: '123', 
        password: 'secret123', 
        token: 'jwt_token_secret',
        total: 10 
      };
      mockRes.locals.commande = commande;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      envoyerEvenementCommande.mockRejectedValue(new Error('Test error'));
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).not.toContain('secret123');
      expect(logCall).not.toContain('jwt_token_secret');
      consoleSpy.mockRestore();
    });

    it('doit valider la structure des données envoyées', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      
      const sentData = envoyerEvenementCommande.mock.calls[0][1];
      expect(sentData).toHaveProperty('evenement');
      expect(sentData).toHaveProperty('commande');
      expect(sentData).toHaveProperty('date');
      expect(typeof sentData.evenement).toBe('string');
      expect(typeof sentData.date).toBe('string');
    });
  });

  describe('Performance', () => {
    it('doit répondre en moins de 100ms', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      const start = Date.now();
      await kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
      expect(mockNext).toHaveBeenCalled();
    });

    it('doit gérer les appels concurrents', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      const promises = Array(10).fill().map(() => 
        kafkaEvenementCommande('cree')(mockReq, mockRes, mockNext)
      );
      
      await Promise.all(promises);
      
      expect(envoyerEvenementCommande).toHaveBeenCalledTimes(10);
      expect(mockNext).toHaveBeenCalledTimes(10);
    });
  });

  describe('Tests d\'intégration', () => {
    it('doit fonctionner avec différents types d\'événements', async () => {
      const commande = { id: '123', total: 10 };
      mockRes.locals.commande = commande;
      envoyerEvenementCommande.mockResolvedValue();
      
      const typesEvenements = ['cree', 'modifie', 'supprime', 'valide', 'annule'];
      
      for (const type of typesEvenements) {
        jest.clearAllMocks();
        envoyerEvenementCommande.mockResolvedValue();
        
        await kafkaEvenementCommande(type)(mockReq, mockRes, mockNext);
        
        expect(envoyerEvenementCommande).toHaveBeenCalledWith(
          'commandes',
          expect.objectContaining({ evenement: type, commande })
        );
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('doit être une fonction qui retourne un middleware Express valide', () => {
      const middleware = kafkaEvenementCommande('cree');
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
      expect(middleware.name).toBeDefined();
    });
  });
});