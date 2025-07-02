import { envoyerEvenementCommande } from '../kafka/producer.js';

/**
 * Middleware pour publier un événement Kafka après une action CRUD sur une commande.
 * @param {string} typeEvenement - 'cree', 'modifie', 'supprime'
 */
export const kafkaEvenementCommande = (typeEvenement) => async (req, res, next) => {
  try {
    const commande = res.locals.commande;
    if (!commande) return next();
    await envoyerEvenementCommande('commandes', {
      evenement: typeEvenement,
      commande,
      date: new Date().toISOString(),
    });
    next();
  } catch (error) {
    // On log l'erreur mais on ne bloque pas la réponse API
    console.error('Erreur envoi Kafka:', error);
    next();
  }
}; 