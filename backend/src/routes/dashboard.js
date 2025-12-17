// dashboard.js
const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware"); // middleware qui vérifie token & role

// Dashboard admin (uniquement admin)
router.get("/admin", auth, (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Admin uniquement." });
  }
  next();
}, dashboardCtrl.adminDashboard);

// Dashboard Point Focal (uniquement PF)
router.get("/point-focal", auth, (req, res, next) => {
  if (req.user?.role !== "pf") {
    return res.status(403).json({ message: "Accès refusé. Point Focal uniquement." });
  }
  next();
}, dashboardCtrl.pointFocalDashboard);

module.exports = router;
