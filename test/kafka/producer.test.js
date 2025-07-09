import { jest } from "@jest/globals";
const mockSend = jest.fn();
const mockConnect = jest.fn();

// Mock ESM de kafkajs
jest.unstable_mockModule("kafkajs", () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: () => ({
      connect: mockConnect,
      send: mockSend,
    }),
  })),
}));

// Import dynamique du module à tester après le mock
let envoyerEvenementCommande;
beforeAll(async () => {
  const producer = await import("../../src/kafka/producer.js");
  envoyerEvenementCommande = producer.envoyerEvenementCommande;
});

describe("Producteur Kafka", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockConnect.mockClear();
  });

  it("doit appeler send avec le bon topic et message", async () => {
    await envoyerEvenementCommande("commandes", { evenement: "cree", commande: { id: 1 } });
    expect(mockSend).toHaveBeenCalledWith({
      topic: "commandes",
      messages: [{ value: JSON.stringify({ evenement: "cree", commande: { id: 1 } }) }],
    });
  });
});
