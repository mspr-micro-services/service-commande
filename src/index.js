import 'dotenv/config';
import express from 'express';
import { authenticateToken } from './middlewares/auth.js';
import authRouter from './routes/auth.js';
import routeurCommandes from './routes/commandeRoutes.js';

const app = express();

app.use(express.json());

// Routes d'authentification
app.use('/auth', authRouter);

// Routes des commandes (protégées)
app.use('/commandes', authenticateToken, routeurCommandes);

// Exemple de route protégée
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Service Commande démarré sur le port ${PORT}`);
  });
}

export default app;