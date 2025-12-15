const express = require("express");
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/mouvementsController");
const router = express.Router();

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getOne);
router.post("/", auth, controller.create);
router.delete("/:id", auth, controller.delete);

module.exports = router;
