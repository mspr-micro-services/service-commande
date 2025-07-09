import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "service-commande",
  brokers: [process.env.KAFKA_BROKER],
});

const producteurKafka = kafka.producer();

export const connecterProducteurKafka = async () => {
  await producteurKafka.connect();
};

export const envoyerEvenementCommande = async (topic, message) => {
  await producteurKafka.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

export default producteurKafka;
