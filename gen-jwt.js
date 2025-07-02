import jwt from 'jsonwebtoken';

const secret = 'jwtpassword'; // Mets ici la même valeur que dans ton .env (JWT_SECRET)
const payload = {
  userId: '123',
  email: 'test@exemple.com'
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);