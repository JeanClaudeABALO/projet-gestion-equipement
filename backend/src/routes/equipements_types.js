const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/equipementsTypesController");

// Lecture accessible à tous les utilisateurs authentifiés
router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getOne);

// Création accessible aux admins et points focaux (pour ajout depuis formulaire)
router.post("/", auth, (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "super_admin" || req.user.role === "pf") {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé. Administrateur ou Point Focal uniquement." });
}, controller.create);

// Modification et suppression réservées aux admins
router.put("/:id", auth, adminOnly, controller.update);
router.delete("/:id", auth, adminOnly, controller.delete);

module.exports = router;
