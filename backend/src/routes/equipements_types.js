const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/equipementsTypesController");

// Lecture accessible à tous les utilisateurs authentifiés
router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getOne);

// Modification réservée aux admins
router.post("/", auth, adminOnly, controller.create);
router.put("/:id", auth, adminOnly, controller.update);
router.delete("/:id", auth, adminOnly, controller.delete);

module.exports = router;
