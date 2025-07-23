import mongoose from 'mongoose';
import { initializeKafka, setupGracefulShutdown } from './kafka/index.js';
import app from './index.js';

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connexion à MongoDB réussie');
    app.listen(PORT, async () => {
      try {
        await initializeKafka();
        setupGracefulShutdown();
        console.log('Services Kafka initialisés avec succès');
      } catch (err) {
        console.error('Erreur de connexion aux services Kafka :', err);
      }
      console.log(`Service Commande démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  });