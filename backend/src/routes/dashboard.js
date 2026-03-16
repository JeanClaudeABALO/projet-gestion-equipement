// dashboard.js
const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware"); // middleware qui vérifie token & role

// Dashboard admin (super_admin et admin)
router.get("/admin", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
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

// Routes pour la vue hiérarchique (super_admin et admin)
router.get("/departements", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getDepartementsWithStats);

router.get("/departements/:departementId/unites", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getUnitesByDepartement);

router.get("/departements/:departementId/equipements", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getEquipementsByDepartement);

router.get("/unites/:uniteId/equipements", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getEquipementsByUnite);

router.get("/unites/:uniteId/equipements-grouped", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getEquipementsByUniteGrouped);

// Routes pour Point Focal
router.get("/point-focal/unites", auth, (req, res, next) => {
  if (req.user?.role !== "pf") {
    return res.status(403).json({ message: "Accès refusé. Point Focal uniquement." });
  }
  next();
}, dashboardCtrl.getUnitesByPointFocal);

router.get("/point-focal/unites/:uniteId/equipements", auth, (req, res, next) => {
  if (req.user?.role !== "pf") {
    return res.status(403).json({ message: "Accès refusé. Point Focal uniquement." });
  }
  next();
}, dashboardCtrl.getEquipementsByUnitePointFocal);

router.get("/point-focal/unites/:uniteId/equipements-grouped", auth, (req, res, next) => {
  if (req.user?.role !== "pf") {
    return res.status(403).json({ message: "Accès refusé. Point Focal uniquement." });
  }
  next();
}, dashboardCtrl.getEquipementsByUniteGroupedPointFocal);

// Route publique pour les statistiques (sans authentification)
router.get("/public-stats", dashboardCtrl.publicStats);

// Statistiques par type d'équipement (admin et super_admin)
router.get("/stats-by-type", auth, (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Accès refusé. Administrateur uniquement." });
  }
  next();
}, dashboardCtrl.getStatsByType);

// Statistiques par type d'équipement (point focal)
router.get("/point-focal/stats-by-type", auth, (req, res, next) => {
  if (req.user?.role !== "pf") {
    return res.status(403).json({ message: "Accès refusé. Point Focal uniquement." });
  }
  next();
}, dashboardCtrl.getStatsByTypePointFocal);

module.exports = router;
