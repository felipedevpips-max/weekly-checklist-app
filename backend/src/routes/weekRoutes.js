const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

router.get("/current", weekController.getCurrentWeek);

module.exports = router;
