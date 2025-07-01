import mongoose from 'mongoose';

const { Schema } = mongoose;

const commandeSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    produits: [
      {
        produitId: { type: String, required: true },
        quantite: { type: Number, required: true },
        prixUnitaire: { type: Number, required: true },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'payée', 'expédiée', 'livrée', 'annulée'],
      default: 'en_attente',
    },
    dateCommande: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Crée automatiquement createdAt / updatedAt
  }
);

const Commande = mongoose.model('Commande', commandeSchema);

export default Commande;
