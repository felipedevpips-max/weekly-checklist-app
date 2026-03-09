const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");
const authMiddleware = require("../middlewares/authMiddleware");

// Semana atual
router.get("/current", authMiddleware, weekController.getCurrentWeek);

// Fechar semana
router.post("/:id/close", authMiddleware, weekController.closeWeek);

// Histórico de semanas (fechadas)
router.get("/", authMiddleware, weekController.getAllWeeks);

// Tasks de uma semana específica
router.get("/:id/tasks", authMiddleware, weekController.getWeekTasks);

// Mover task para semana aberta
router.post("/open/tasks", authMiddleware, weekController.moveTaskToOpenWeek);

// Mover task de volta para semana específica
router.post("/move-back", authMiddleware, weekController.moveTaskBackToWeek);

module.exports = router;