import cors from "cors";
import "dotenv/config";
import express from "express";
import { authenticateToken } from "./middlewares/auth.js";
import authRouter from "./routes/auth.js";
import routeurCommandes from "./routes/commandeRoutes.js";

const app = express();

app.use(express.json());
app.use(cors()); // Ajout du middleware CORS

// Routes d'authentification
app.use("/auth", authRouter);

// Routes des commandes (protégées)
app.use("/commandes", authenticateToken, routeurCommandes);

// Route de test pour le middleware d'erreur globale
app.get("/test-error", (req, res, next) => {
  next(new Error("Erreur volontaire pour test"));
});

// Middleware de gestion d'erreur globale
app.use((err, req, res, next) => {
  console.error("Erreur non gérée :", err);
  res.status(500).json({ message: "Erreur serveur" });
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Service Commande démarré sur le port ${PORT}`);
  });
}

export default app;
