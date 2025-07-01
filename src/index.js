require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware JSON
app.use(express.json());

// Route racine
app.get("/", (req, res) => {
  res.status(200).json({ message: "Service Commande OK" });
});

// Connexion MongoDB
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/service-commande";

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connecté");
    // Démarrage serveur après connexion DB
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Service commande démarré sur le port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion MongoDB:", err);
  });

module.exports = app;
