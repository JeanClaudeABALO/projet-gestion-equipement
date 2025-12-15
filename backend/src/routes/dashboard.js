// dashboard.js
const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware"); // middleware qui vérifie token & role

// uniquement admin
router.get("/admin", auth, (req, res, next) => {
  // vérifier rôle (si middleware ne l'a pas déjà fait)
  if (req.user?.role !== "admin" && req.user?.role_id !== 1) {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
}, dashboardCtrl.adminDashboard);

module.exports = router;
