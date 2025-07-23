import { kafkaProducerService } from './producer.js';
import { kafkaConsumerService } from './consumer.js';

/**
 * Initialise les services Kafka pour le microservice Commandes
 */
async function initializeKafka() {
  try {
    console.log('🚀 Initialisation des services Kafka...');

    // Connexion du producteur
    await kafkaProducerService.connect();

    // Connexion du consommateur
    await kafkaConsumerService.connect();

    // Abonnement aux topics
    await kafkaConsumerService.subscribeToTopics();

    console.log('✅ Services Kafka initialisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Kafka:', error);
    throw error;
  }
}

/**
 * Ferme proprement les connexions Kafka
 */
async function shutdownKafka() {
  try {
    console.log('🔄 Arrêt des services Kafka...');

    // Déconnexion du consommateur
    await kafkaConsumerService.disconnect();

    // Déconnexion du producteur
    await kafkaProducerService.disconnect();

    console.log('✅ Services Kafka arrêtés proprement');
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt Kafka:', error);
  }
}

/**
 * Gestion des signaux d'arrêt pour une fermeture propre
 */
function setupGracefulShutdown() {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`📡 Signal ${signal} reçu, arrêt en cours...`);
      await shutdownKafka();
      process.exit(0);
    });
  });
}

export {
  initializeKafka,
  shutdownKafka,
  setupGracefulShutdown,
  kafkaProducerService,
  kafkaConsumerService,
};