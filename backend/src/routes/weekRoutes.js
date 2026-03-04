const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

// Semana atual
router.get("/current", weekController.getCurrentWeek);

// Fechar semana
router.post("/:id/close", weekController.closeWeek);

// Histórico: todas as semanas
router.get("/", weekController.getAllWeeks);

// Histórico: tasks de uma semana específica
router.get("/:id/tasks", weekController.getWeekTasks);

module.exports = router;
