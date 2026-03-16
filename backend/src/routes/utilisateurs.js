const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const superAdminOnly = require("../middleware/superAdminMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const controller = require("../controllers/utilisateursControllers");

// Middleware pour autoriser super_admin et admin
const adminOrSuperAdmin = (req, res, next) => {
  if (req.user.role === "super_admin" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ 
    message: "Accès refusé. Administrateur ou Super Administrateur uniquement." 
  });
};

// Lister tous les utilisateurs (super_admin et admin)
router.get("/", auth, adminOrSuperAdmin, controller.getAll);

// Récupérer un utilisateur (super_admin et admin)
router.get("/:id", auth, adminOrSuperAdmin, controller.getOne);

// Créer un utilisateur (super_admin peut créer admin et pf, admin peut créer uniquement pf)
router.post("/", auth, adminOrSuperAdmin, controller.create);

// Modifier un utilisateur (super_admin seulement)
router.put("/:id", auth, superAdminOnly, controller.update);

// Supprimer un utilisateur (super_admin seulement)
router.delete("/:id", auth, superAdminOnly, controller.delete);

module.exports = router;
