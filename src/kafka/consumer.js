import { kafka, KAFKA_TOPICS } from '../config/kafka.js';
import { kafkaProducerService } from './producer.js';

/**
 * Service consommateur Kafka pour le microservice Commandes
 *
 * Ce service gère la connexion au broker Kafka et la consommation des messages
 * provenant des autres microservices.
 */
class KafkaConsumerService {
  constructor() {
    this.consumer = kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'commandes-service-group',
    });
    this.isConnected = false;
  }

  /**
   * Établit la connexion avec le broker Kafka
   */
  async connect() {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('✅ Kafka Consumer connecté');
    } catch (error) {
      console.error('❌ Erreur connexion Kafka Consumer:', error);
      throw error;
    }
  }

  /**
   * S'abonne aux topics Kafka pertinents pour le microservice Commandes
   */
  async subscribeToTopics() {
    try {
      // Abonnement aux topics des clients
      await this.consumer.subscribe({ topic: KAFKA_TOPICS.CONSUMED.CLIENT_EVENTS, fromBeginning: false });
      await this.consumer.subscribe({ topic: KAFKA_TOPICS.CONSUMED.CLIENT_CREATED, fromBeginning: false });
      await this.consumer.subscribe({ topic: KAFKA_TOPICS.CONSUMED.CLIENT_UPDATED, fromBeginning: false });

      // Abonnement aux topics des produits
      await this.consumer.subscribe({ topic: KAFKA_TOPICS.CONSUMED.PRODUIT_EVENTS, fromBeginning: false });
      await this.consumer.subscribe({ topic: KAFKA_TOPICS.CONSUMED.PRODUIT_STOCK_UPDATED, fromBeginning: false });

      // Configuration du gestionnaire de messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const key = message.key?.toString();
            const value = message.value ? JSON.parse(message.value.toString()) : null;
            const headers = this.parseHeaders(message.headers);

            console.log(`📨 Message reçu sur ${topic}:`, {
              key,
              eventType: headers['event-type'],
              source: headers.source,
              partition,
              offset: message.offset,
            });

            // Traitement des messages selon le topic
            switch (topic) {
              case KAFKA_TOPICS.CONSUMED.CLIENT_CREATED:
                await this.handleClientCreated(value, headers);
                break;
              case KAFKA_TOPICS.CONSUMED.CLIENT_UPDATED:
                await this.handleClientUpdated(value, headers);
                break;
              case KAFKA_TOPICS.CONSUMED.PRODUIT_STOCK_UPDATED:
                await this.handleProduitStockUpdated(value, headers);
                break;
              default:
                console.log(`ℹ️ Topic non géré: ${topic}`);
            }
          } catch (error) {
            console.error(`❌ Erreur traitement message sur ${topic}:`, error);
          }
        },
      });

      console.log('🎧 Consumer en écoute des événements...');
      console.log('📡 Topics écoutés:');
      Object.values(KAFKA_TOPICS.CONSUMED).forEach((topic) => {
        console.log(`  - ${topic}`);
      });
    } catch (error) {
      console.error('❌ Erreur souscription topics:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion avec le broker Kafka
   */
  async disconnect() {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('🔌 Kafka Consumer déconnecté');
    } catch (error) {
      console.error('❌ Erreur déconnexion Kafka Consumer:', error);
    }
  }

  /**
   * Parse les en-têtes du message Kafka
   * @param {Object} headers En-têtes du message
   * @returns {Object} En-têtes parsés
   */
  parseHeaders(headers) {
    const result = {};
    for (const [key, value] of Object.entries(headers || {})) {
      if (value !== null && value !== undefined) {
        result[key] = value.toString();
      }
    }
    return result;
  }

  /**
   * Gère les événements de création de client
   * @param {Object} data Données du client créé
   * @param {Object} headers En-têtes du message
   */
  async handleClientCreated(data, headers) {
    try {
      console.log('📥 Traitement événement client-created:', { clientId: data._id || data.id });
      // Logique métier pour traiter la création d'un client
      // Par exemple, initialiser des données spécifiques au client pour les commandes
    } catch (error) {
      console.error('❌ Erreur lors du traitement de client-created:', error);
    }
  }

  /**
   * Gère les événements de mise à jour de client
   * @param {Object} data Données du client mis à jour
   * @param {Object} headers En-têtes du message
   */
  async handleClientUpdated(data, headers) {
    try {
      console.log('📥 Traitement événement client-updated:', { clientId: data._id || data.id });
      // Logique métier pour traiter la mise à jour d'un client
      // Par exemple, mettre à jour les informations client dans les commandes existantes
    } catch (error) {
      console.error('❌ Erreur lors du traitement de client-updated:', error);
    }
  }

  /**
   * Gère les événements de mise à jour de stock de produit
   * @param {Object} data Données de mise à jour du stock
   * @param {Object} headers En-têtes du message
   */
  async handleProduitStockUpdated(data, headers) {
    try {
      console.log('📥 Traitement événement produit-stock-updated:', { 
        produitId: data.produitId,
        nouveauStock: data.nouveauStock 
      });
      
      // Logique métier pour traiter la mise à jour du stock
      // Par exemple, vérifier si des commandes en attente peuvent être traitées
      // ou annuler des commandes si le stock est insuffisant
      
      if (data.nouveauStock === 0) {
        console.warn(`⚠️ Stock épuisé pour le produit ${data.produitId}`);
        // Ici on pourrait notifier les clients ou annuler des commandes en attente
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement de produit-stock-updated:', error);
    }
  }

  /**
   * Méthode legacy pour traiter les messages (rétrocompatibilité)
   * @param {Object} message Message Kafka
   */
  async processMessage(message) {
    try {
      const data = JSON.parse(message.value.toString());
      console.log('📥 Message reçu (legacy):', data);
      
      // Traitement générique des messages legacy
      // Cette méthode peut être utilisée pour maintenir la compatibilité
      // avec l'ancien système de messages
    } catch (error) {
      console.error('❌ Erreur traitement message legacy:', error);
    }
  }
}

// Instance singleton
const kafkaConsumerService = new KafkaConsumerService();

// Fonctions d'export pour rétrocompatibilité
const connectConsumer = () => kafkaConsumerService.connect();
const subscribeToTopics = () => kafkaConsumerService.subscribeToTopics();
const disconnectConsumer = () => kafkaConsumerService.disconnect();

/**
 * Fonction legacy pour traiter un message (rétrocompatibilité)
 * @param {Object} message Message à traiter
 */
const processMessage = (message) => kafkaConsumerService.processMessage(message);

export {
  KafkaConsumerService,
  kafkaConsumerService,
  connectConsumer,
  subscribeToTopics,
  disconnectConsumer,
  processMessage,
};