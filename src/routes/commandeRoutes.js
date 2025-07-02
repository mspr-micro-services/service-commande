// src/routes/commandeRoutes.js
import express from 'express';
import {
    createCommande,
    deleteCommande,
    getAllCommandes,
    getCommandeById,
    updateCommande,
} from '../controllers/commandeController.js';

const router = express.Router();

router.post('/', createCommande);
router.get('/', getAllCommandes);
router.get('/:id', getCommandeById);
router.put('/:id', updateCommande);
router.delete('/:id', deleteCommande);

export default router;
