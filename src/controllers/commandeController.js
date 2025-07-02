// src/controllers/commandeController.js
import Commande from '../models/commande.js';

// CREATE
export const createCommande = async (req, res) => {
  try {
    const commande = new Commande(req.body);
    const savedCommande = await commande.save();
    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find();
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one by ID
export const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateCommande = async (req, res) => {
  try {
    const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCommande) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(updatedCommande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteCommande = async (req, res) => {
  try {
    const deletedCommande = await Commande.findByIdAndDelete(req.params.id);
    if (!deletedCommande) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
