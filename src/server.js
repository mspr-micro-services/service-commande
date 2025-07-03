import mongoose from 'mongoose';
import { connecterProducteurKafka } from './kafka/producer.js';
import app from './index.js';

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
    process.exit(1);
  });