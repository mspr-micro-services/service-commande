import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'service-commande',
  brokers: [process.env.KAFKA_BROKER],
});

const consommateurKafka = kafka.consumer({ groupId: 'service-commande-group' });

export const connecterConsommateurKafka = async (topic, gererMessage) => {
  await consommateurKafka.connect();
  await consommateurKafka.subscribe({ topic, fromBeginning: true });
  await consommateurKafka.run({
    eachMessage: async ({ topic, partition, message }) => {
      gererMessage({
        topic,
        partition,
        valeur: message.value.toString(),
      });
    },
  });
};

export default consommateurKafka; 