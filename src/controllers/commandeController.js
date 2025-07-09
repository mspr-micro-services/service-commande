import Commande from "../models/commande.js";

export const creerCommande = async (req, res, next) => {
  try {
    const commande = new Commande(req.body);
    const commandeEnregistree = await commande.save();
    res.locals.commande = commandeEnregistree;
    res.status(201).json(commandeEnregistree);
    if (next) next();
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

export const lireToutesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find();
    res.json(commandes);
  } catch (erreur) {
    res.status(500).json({ message: erreur.message });
  }
};

export const lireCommandeParId = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });
    res.json(commande);
  } catch (erreur) {
    console.error("Erreur lecture commande par ID:", erreur);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const modifierCommande = async (req, res, next) => {
  try {
    const commandeModifiee = await Commande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!commandeModifiee) return res.status(404).json({ message: "Commande non trouvée" });
    res.locals.commande = commandeModifiee;
    res.json(commandeModifiee);
    if (next) next();
  } catch (erreur) {
    console.error("Erreur modification commande:", erreur);
    if (erreur.name === "ValidationError") {
      return res.status(400).json({ message: erreur.message });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const supprimerCommande = async (req, res, next) => {
  try {
    const commandeSupprimee = await Commande.findByIdAndDelete(req.params.id);
    if (!commandeSupprimee) return res.status(404).json({ message: "Commande non trouvée" });
    res.locals.commande = commandeSupprimee;
    res.json({ message: "Commande supprimée" });
    if (next) next();
  } catch (erreur) {
    console.error("Erreur suppression commande:", erreur);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
