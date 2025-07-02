import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Commande from './commande.js';

dotenv.config(); // Charge les variables d'environnement depuis .env

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connexion MongoDB réussie.");

    const nouvelleCommande = new Commande({
      clientId: "client_123",
      produits: [
        { produitId: "prod_001", quantite: 2, prixUnitaire: 5.5 },
        { produitId: "prod_002", quantite: 1, prixUnitaire: 10.0 }
      ],
      total: 21.0,
      statut: "en_attente"
    });

    await nouvelleCommande.save();
    console.log("🎉 Commande sauvegardée :", nouvelleCommande);

    await mongoose.disconnect();
  })
  .catch(err => {
    console.error("❌ Erreur MongoDB :", err);
  });
