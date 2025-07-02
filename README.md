# Service Commande

Microservice Express.js pour la gestion des commandes dans un projet de vente en ligne de café.

## Fonctionnalités principales
- CRUD complet sur les commandes (MongoDB)
- Communication inter-services via Kafka (kafkajs)
- Authentification JWT
- Interface graphique de la base via mongo-express
- Tests unitaires et d'intégration (Jest, Supertest)
- Déploiement facile avec Docker Compose

---

## Prérequis
- Node.js >= 18
- Docker & Docker Compose

---

## Installation & Lancement

### 1. Cloner le dépôt
```bash
git clone https://github.com/mspr-micro-services/service-commande.git
cd service-commande
```

### 2. Variables d'environnement
Créer un fichier `.env` à la racine :
```
PORT=3001
MONGO_URL=mongodb://mongo:27017/service-commande
JWT_SECRET=supersecret
KAFKA_BROKER=kafka:9092
```

### 3. Lancer l'infrastructure complète
```bash
docker compose up --build
```
- Accès API : http://localhost:3001
- Interface Mongo Express : http://localhost:8081 (user: admin / password: password)

---

## Utilisation de l'API

### Authentification
- **POST** `/auth/login`
  - Body : `{ "username": "admin", "role": "admin" }`
  - Retourne un token JWT à utiliser dans l'en-tête `Authorization: Bearer <token>`

### Commandes
- **POST** `/commandes` : Créer une commande
- **GET** `/commandes` : Lister toutes les commandes
- **GET** `/commandes/:id` : Détail d'une commande
- **PUT** `/commandes/:id` : Modifier une commande
- **DELETE** `/commandes/:id` : Supprimer une commande

#### Exemple de payload POST
```json
{
  "clientId": "1234567890",
  "produits": [
    { "produitId": "cafe-arabica-01", "quantite": 2, "prixUnitaire": 8.5 }
  ],
  "total": 17.0,
  "statut": "en_attente"
}
```

---

## Kafka
- Producteur : publie un événement sur le topic `commandes` à chaque action CRUD
- Consommateur : prêt à écouter les topics d'autres microservices (ex : produits, clients)

---

## Tests
- **Lancer tous les tests** :
```bash
npm test
```
- Les tests couvrent :
  - Middleware Kafka
  - Routes commandes (CRUD)
  - Authentification

---

## Licence
ISC 