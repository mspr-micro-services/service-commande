import { Kafka, logLevel } from 'kafkajs';

/**
 * Configuration Kafka pour le microservice Commandes
 */
const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'commandes-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
};

// Instance Kafka
const kafka = new Kafka(kafkaConfig);

/**
 * Topics Kafka utilisés par le microservice Commandes
 */
const KAFKA_TOPICS = {
  // Topics que ce service produit
  PRODUCED: {
    COMMANDE_EVENTS: 'commande-events',
    COMMANDE_CREATED: 'commande-created',
    COMMANDE_UPDATED: 'commande-updated',
    COMMANDE_DELETED: 'commande-deleted',
  },
  // Topics que ce service consomme
  CONSUMED: {
    CLIENT_EVENTS: 'client-events',
    CLIENT_CREATED: 'client-created',
    CLIENT_UPDATED: 'client-updated',
    PRODUIT_EVENTS: 'produit-events',
    PRODUIT_STOCK_UPDATED: 'produit-stock-updated',
  },
};

/**
 * Configuration des en-têtes par défaut pour les messages Kafka
 */
const DEFAULT_HEADERS = {
  'content-type': 'application/json',
  'source': 'commandes-service',
  'version': '1.0',
};

export {
  kafka,
  kafkaConfig,
  KAFKA_TOPICS,
  DEFAULT_HEADERS,
};