const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/equipementsController");

// Routes ADMIN uniquement (CRUD complet)
router.get("/", auth, adminOnly, controller.getAll);
router.get("/:id", auth, adminOnly, controller.getOne);
router.post("/", auth, adminOnly, controller.create);
router.put("/:id", auth, adminOnly, controller.update);
router.delete("/:id", auth, adminOnly, controller.delete);

// Routes Point Focal (mise à jour d'état uniquement)
router.patch("/:id/etat", auth, controller.updateEtat);
router.patch("/:id/reparation", auth, controller.declarerReparation);
router.patch("/:id/manquant", auth, controller.marquerManquant);

// Route pour PF : voir équipements de son département
router.get("/departement/mon-departement", auth, controller.getByDepartement);

module.exports = router;
