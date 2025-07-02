import express from 'express';
import {
    creerCommande,
    lireCommandeParId,
    lireToutesCommandes,
    modifierCommande,
    supprimerCommande
} from '../controllers/commandeController.js';
import { kafkaEvenementCommande } from '../middlewares/kafkaEvenementCommande.js';

const routeur = express.Router();

// Créer une commande
routeur.post('/', creerCommande, kafkaEvenementCommande('cree'));

// Lire toutes les commandes
routeur.get('/', lireToutesCommandes);

// Lire une commande par ID
routeur.get('/:id', lireCommandeParId);

// Modifier une commande
routeur.put('/:id', modifierCommande, kafkaEvenementCommande('modifie'));

// Supprimer une commande
routeur.delete('/:id', supprimerCommande, kafkaEvenementCommande('supprime'));

export default routeur; 