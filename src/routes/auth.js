import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ message: 'username et role requis' });
  }

  // Génère un token JWT
  const payload = { username, role };
  
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

  res.json({ token });
});

export default router;
