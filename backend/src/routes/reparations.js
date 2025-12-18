const express = require("express");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/reparationsController");
const router = express.Router();

// PF : réparations de son département
router.get("/departement/mon-departement", auth, controller.getByDepartement);

// PF : déclarer une panne
router.post("/", auth, controller.create);

// ADMIN : lister toutes les réparations
router.get("/", auth, adminOnly, controller.getAll);

// ADMIN : mise à jour du statut / traitement
router.put("/:id/statut", auth, adminOnly, controller.updateStatut);

// ADMIN : suppression éventuelle
router.delete("/:id", auth, adminOnly, controller.delete);

module.exports = router;
