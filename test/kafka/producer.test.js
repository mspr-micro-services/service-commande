import * as producer from '../../src/kafka/producer.js';

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: () => ({
      connect: jest.fn(),
      send: jest.fn()
    })
  }))
}));

describe('Producteur Kafka', () => {
  it('doit appeler send avec le bon topic et message', async () => {
    const spy = jest.spyOn(producer.default, 'send').mockResolvedValue();
    await producer.envoyerEvenementCommande('commandes', { evenement: 'cree', commande: { id: 1 } });
    expect(spy).toHaveBeenCalledWith({
      topic: 'commandes',
      messages: [{ value: JSON.stringify({ evenement: 'cree', commande: { id: 1 } }) }]
    });
    spy.mockRestore();
  });
});