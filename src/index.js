import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Middleware d'authentification
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// Route d'authentification
app.use('/auth', authRouter);

// Exemple de route protégée (à adapter pour les commandes)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Service Commande démarré sur le port ${PORT}`);
});