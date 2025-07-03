import * as producer from '../../src/kafka/producer.js';
import { kafkaEvenementCommande } from '../../src/middlewares/kafkaEvenementCommande.js';

describe('Middleware kafkaEvenementCommande', () => {
  it('doit appeler envoyerEvenementCommande avec les bons arguments', async () => {
    const req = {};
    const res = { locals: { commande: { id: '123', total: 10 } } };
    const next = jest.fn();
    const spy = jest.spyOn(producer, 'envoyerEvenementCommande').mockResolvedValue();

    await kafkaEvenementCommande('cree')(req, res, next);

    expect(spy).toHaveBeenCalledWith('commandes', expect.objectContaining({
      evenement: 'cree',
      commande: { id: '123', total: 10 }
    }));
    expect(next).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('ne fait rien si res.locals.commande est absent', async () => {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();
    const spy = jest.spyOn(producer, 'envoyerEvenementCommande').mockResolvedValue();

    await kafkaEvenementCommande('cree')(req, res, next);

    expect(spy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    spy.mockRestore();
  });
});