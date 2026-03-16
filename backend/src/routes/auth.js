const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

router.post("/login", AuthController.login);
router.get("/admin-exists", AuthController.checkAdminExists);
router.post("/register-admin", AuthController.registerAdmin);
router.post("/change-password", AuthController.changePassword);

module.exports = router;
