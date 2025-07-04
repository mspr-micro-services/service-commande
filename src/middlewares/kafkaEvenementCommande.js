import { envoyerEvenementCommande } from '../kafka/producer.js';

/**
 * Middleware pour publier un événement Kafka après une action CRUD sur une commande.
 * 
 * @param {string} typeEvenement - Type d'événement ('cree', 'modifie', 'supprime', etc.)
 * @returns {Function} Middleware Express
 * @throws {Error} Si typeEvenement est invalide
 * 
 * @example
 * app.post('/commandes', 
 *   creerCommande, 
 *   kafkaEvenementCommande('cree')
 * );
 */
export const kafkaEvenementCommande = (typeEvenement) => {
  // Validation des paramètres d'entrée
  if (!typeEvenement || typeof typeEvenement !== 'string' || typeEvenement.trim() === '') {
    throw new Error('typeEvenement doit être une chaîne non vide');
  }

  return async (req, res, next) => {
    try {
      const commande = res.locals.commande;
      
      // Si pas de commande, on continue sans envoyer d'événement
      if (!commande) {
        return next();
      }

      // Validation de la structure de la commande
      if (typeof commande !== 'object' || commande === null) {
        console.warn('Commande invalide dans res.locals:', typeof commande);
        return next();
      }

      // Envoi de l'événement Kafka
      await envoyerEvenementCommande('commandes', {
        evenement: typeEvenement,
        commande,
        date: new Date().toISOString(),
        metadata: {
          timestamp: Date.now(),
          source: 'service-commande',
          version: '1.0.0'
        }
      });

      next();
    } catch (error) {
      // Log 
      const safeError = {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n')[0]
      };
      
      console.error('Erreur envoi Kafka:', safeError);
      
      // On continue le flux Express même en cas d'erreur Kafka
      next();
    }
  };
}; 