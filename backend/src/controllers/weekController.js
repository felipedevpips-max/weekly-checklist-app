const weekService = require("../services/weekService");
const taskService = require("../services/taskService");

// Semana atual
async function getCurrentWeek(req, res) {
  try {
    const data = await weekService.getCurrentWeekWithTasks();
    if (!data) return res.status(404).json({ message: "Nenhuma semana ativa encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Fechar semana
async function closeWeek(req, res) {
  try {
    const { id } = req.params;
    const result = await weekService.closeWeek(Number(id));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Histórico de todas semanas fechadas
async function getAllWeeks(req, res) {
  try {
    const weeks = await weekService.getClosedWeeks();
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Tasks de uma semana específica
async function getWeekTasks(req, res) {
  try {
    const { id } = req.params;
    const tasks = await weekService.getWeekTasks(Number(id));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Mover task para semana aberta
async function moveTaskToOpenWeek(req, res) {
  try {
    const { taskId } = req.body;
    const task = await taskService.moveTaskToOpenWeek(taskId);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getCurrentWeek,
  closeWeek,
  getAllWeeks,
  getWeekTasks,
  moveTaskToOpenWeek,
};