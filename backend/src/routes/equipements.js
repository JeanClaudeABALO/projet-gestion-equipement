const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/equipementsController");

// Routes ADMIN uniquement (lecture / modification / suppression globales)
router.get("/", auth, adminOnly, controller.getAll);
router.get("/:id", auth, adminOnly, controller.getOne);
router.put("/:id", auth, adminOnly, controller.update);
router.delete("/:id", auth, adminOnly, controller.delete);

// Création d'un équipement :
// - ADMIN : partout
// - PF    : uniquement dans les unités de son département (vérifié dans le contrôleur)
router.post("/", auth, controller.create);

// Routes Point Focal (mise à jour d'état uniquement)
router.patch("/:id/etat", auth, controller.updateEtat);
router.patch("/:id/reparation", auth, controller.declarerReparation);
router.patch("/:id/manquant", auth, controller.marquerManquant);

// Route pour PF : voir équipements de son département
router.get("/departement/mon-departement", auth, controller.getByDepartement);

module.exports = router;
