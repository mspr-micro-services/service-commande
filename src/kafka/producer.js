import { kafka, KAFKA_TOPICS, DEFAULT_HEADERS } from '../config/kafka.js';

/**
 * Service producteur Kafka pour le microservice Commandes
 *
 * Ce service gère la connexion au broker Kafka et la publication des événements
 * liés aux commandes vers les autres microservices.
 */
class KafkaProducerService {
  constructor() {
    this.producer = kafka.producer();
    this.isConnected = false;
  }

  /**
   * Établit la connexion avec le broker Kafka
   */
  async connect() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka Producer connecté');
    } catch (error) {
      console.error('❌ Erreur connexion Kafka Producer:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion avec le broker Kafka
   */
  async disconnect() {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('🔌 Kafka Producer déconnecté');
    } catch (error) {
      console.error('❌ Erreur déconnexion Kafka Producer:', error);
    }
  }

  /**
   * Publie un message sur un topic Kafka
   * @param {string} topic Topic de destination
   * @param {Object} data Données à publier
   * @param {Object} options Options supplémentaires (key, headers, etc.)
   */
  async publishMessage(topic, data, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Producer non connecté');
      }

      const message = {
        key: options.key || null,
        value: JSON.stringify(data),
        headers: {
          ...DEFAULT_HEADERS,
          'event-type': options.eventType || 'unknown',
          'timestamp': new Date().toISOString(),
          ...options.headers,
        },
      };

      await this.producer.send({
        topic,
        messages: [message],
      });

      console.log(`📤 Message publié sur ${topic}:`, {
        key: message.key,
        eventType: message.headers['event-type'],
        dataSize: JSON.stringify(data).length,
      });
    } catch (error) {
      console.error(`❌ Erreur publication sur ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Publie un événement de création de commande
   * @param {Object} commande Données de la commande créée
   */
  async publishCommandeCreated(commande) {
    await this.publishMessage(
      KAFKA_TOPICS.PRODUCED.COMMANDE_CREATED,
      commande,
      {
        key: commande._id || commande.id,
        eventType: 'commande-created',
        headers: {
          'aggregate-id': commande._id || commande.id,
          'aggregate-type': 'commande',
        },
      }
    );
  }

  /**
   * Publie un événement de mise à jour de commande
   * @param {Object} commande Données de la commande mise à jour
   */
  async publishCommandeUpdated(commande) {
    await this.publishMessage(
      KAFKA_TOPICS.PRODUCED.COMMANDE_UPDATED,
      commande,
      {
        key: commande._id || commande.id,
        eventType: 'commande-updated',
        headers: {
          'aggregate-id': commande._id || commande.id,
          'aggregate-type': 'commande',
        },
      }
    );
  }

  /**
   * Publie un événement de suppression/annulation de commande
   * @param {Object} commande Données de la commande supprimée
   */
  async publishCommandeDeleted(commande) {
    await this.publishMessage(
      KAFKA_TOPICS.PRODUCED.COMMANDE_DELETED,
      commande,
      {
        key: commande._id || commande.id,
        eventType: 'commande-deleted',
        headers: {
          'aggregate-id': commande._id || commande.id,
          'aggregate-type': 'commande',
        },
      }
    );
  }

  /**
   * Publie un événement générique de commande (legacy)
   * @param {string} eventType Type d'événement
   * @param {Object} data Données de l'événement
   */
  async publishCommandeEvent(eventType, data) {
    await this.publishMessage(
      KAFKA_TOPICS.PRODUCED.COMMANDE_EVENTS,
      {
        typeEvenement: eventType,
        commande: data,
        timestamp: new Date().toISOString(),
        service: 'commandes',
      },
      {
        key: data._id || data.id,
        eventType: `commande-${eventType}`,
        headers: {
          'legacy-event': 'true',
        },
      }
    );
  }
}

// Instance singleton
const kafkaProducerService = new KafkaProducerService();

// Fonctions d'export pour rétrocompatibilité
const connectProducer = () => kafkaProducerService.connect();
const disconnectProducer = () => kafkaProducerService.disconnect();

/**
 * Fonction legacy pour envoyer un message (rétrocompatibilité)
 * @param {string} topic Topic de destination
 * @param {Object} message Message à envoyer
 */
const sendMessage = async (topic, message) => {
  await kafkaProducerService.publishMessage(topic, message);
};

export {
  KafkaProducerService,
  kafkaProducerService,
  connectProducer,
  disconnectProducer,
  sendMessage,
};
