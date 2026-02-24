const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

router.get("/current", weekController.getCurrentWeek);
router.post("/:id/close", weekController.closeWeek);

module.exports = router;
