import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token mal formaté' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });

    req.user = user;
    next();
  });
}

/**
 * Restreint l'accès à une route selon un rôle
 * @param {string|string[]} roles - Rôle ou liste de rôles autorisés
 */
export function authorizeRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle insuffisant" });
    }
    next();
  };
}

export default authenticateToken;
