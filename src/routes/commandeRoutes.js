import express from "express";
import {
  creerCommande,
  lireCommandeParId,
  lireToutesCommandes,
  modifierCommande,
  supprimerCommande,
} from "../controllers/commandeController.js";
import { authorizeRole } from "../middlewares/auth.js";
import { kafkaEvenementCommande } from "../middlewares/kafkaEvenementCommande.js";
import Commande from "../models/commande.js";

const routeur = express.Router();

// Création d'une commande (admin et revendeurs)
routeur.post("/", authorizeRole(["admin", "revendeurs"]), creerCommande, kafkaEvenementCommande("cree"));

// Lecture de toutes les commandes (admin uniquement)
routeur.get("/", authorizeRole("admin"), lireToutesCommandes);

// Lecture d'une commande par ID (accessible à tout utilisateur authentifié)
routeur.get("/:id", lireCommandeParId);

// Modification d'une commande (admin et revendeurs)
routeur.put("/:id", authorizeRole(["admin", "revendeurs"]), modifierCommande, kafkaEvenementCommande("modifie"));

// Suppression d'une commande (admin et revendeurs)
routeur.delete("/:id", authorizeRole(["admin", "revendeurs"]), supprimerCommande, kafkaEvenementCommande("supprime"));

// Liste des commandes d'un revendeur (accessible au revendeur concerné ou à l'admin)
routeur.get("/revendeur/:id", authorizeRole(["admin", "revendeurs"]), async (req, res) => {
  const { id } = req.params;
  // Si le user est revendeur, il ne peut voir que ses propres commandes
  if (req.user.role === "revendeurs" && req.user.id !== id) {
    return res.status(403).json({ message: "Accès interdit" });
  }
  try {
    const commandes = await Commande.find({ revendeurId: id });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Liste des commandes d'un webshop (accessible au webshop concerné ou à l'admin)
routeur.get("/webshop/:id", authorizeRole(["admin", "webshop"]), async (req, res) => {
  const { id } = req.params;
  // Si le user est webshop, il ne peut voir que ses propres commandes
  if (req.user.role === "webshop" && req.user.id !== id) {
    return res.status(403).json({ message: "Accès interdit" });
  }
  try {
    const commandes = await Commande.find({ webshopId: id });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default routeur;
