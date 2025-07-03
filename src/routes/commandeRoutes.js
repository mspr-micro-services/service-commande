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

routeur.post('/', creerCommande, kafkaEvenementCommande('cree'));

routeur.get('/', lireToutesCommandes);

routeur.get('/:id', lireCommandeParId);

routeur.put('/:id', modifierCommande, kafkaEvenementCommande('modifie'));

routeur.delete('/:id', supprimerCommande, kafkaEvenementCommande('supprime'));

export default routeur;
