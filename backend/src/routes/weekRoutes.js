const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

// Semana atual
router.get("/current", weekController.getCurrentWeek);

// Fechar semana
router.post("/:id/close", weekController.closeWeek);

// Histórico de semanas (fechadas)
router.get("/", weekController.getAllWeeks);

// Tasks de uma semana específica
router.get("/:id/tasks", weekController.getWeekTasks);

// Mover task para semana aberta
router.post("/open/tasks", weekController.moveTaskToOpenWeek);

// Mover task de volta para semana específica (undo)
router.post("/move-back", weekController.moveTaskBackToWeek);

module.exports = router;
