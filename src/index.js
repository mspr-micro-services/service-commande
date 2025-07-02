import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connecterProducteurKafka } from './kafka/producer.js';
import { authenticateToken } from './middlewares/auth.js';
import authRouter from './routes/auth.js';
import routeurCommandes from './routes/commandeRoutes.js';

const app = express();
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connexion à MongoDB réussie');
    app.listen(PORT, async () => {
      try {
        await connecterProducteurKafka();
        console.log('Producteur Kafka connecté');
      } catch (err) {
        console.error('Erreur de connexion au producteur Kafka :', err);
      }
      console.log(`Service Commande démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1); // Arrête le process si la connexion échoue
  });

app.use(express.json());

// Routes d'authentification
app.use('/auth', authRouter);

// Routes des commandes (protégées)
app.use('/commandes', authenticateToken, routeurCommandes);

// Exemple de route protégée
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});