const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");

router.get("/", taskController.getTasks);

module.exports = router;