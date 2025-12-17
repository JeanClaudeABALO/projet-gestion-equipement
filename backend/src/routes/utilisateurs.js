const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/utilisateursControllers");

// Lister tous les utilisateurs (admin seulement)
router.get("/", auth, adminOnly, controller.getAll);

// Récupérer un utilisateur (admin seulement)
router.get("/:id", auth, adminOnly, controller.getOne);

// Créer un utilisateur (admin seulement)
router.post("/", auth, adminOnly, controller.create);

// Modifier un utilisateur (admin seulement)
router.put("/:id", auth, adminOnly, controller.update);

// Supprimer un utilisateur (admin seulement)
router.delete("/:id", auth, adminOnly, controller.delete);

module.exports = router;
