const weekService = require("../services/weekService");
const taskService = require("../services/taskService");

// Semana atual
async function getCurrentWeek(req, res) {
  try {
    const data = await weekService.getCurrentWeekWithTasks();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Fechar semana
async function closeWeek(req, res) {
  try {
    const { id } = req.params;
    const result = await weekService.closeWeek(Number(id));
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Histórico de semanas fechadas
async function getAllWeeks(req, res) {
  try {
    const weeks = await weekService.getClosedWeeks();
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Tasks de uma semana específica
async function getWeekTasks(req, res) {
  try {
    const { id } = req.params;
    const tasks = await taskService.getTasksByWeek(Number(id));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Mover task para semana aberta
async function moveTaskToOpenWeek(req, res) {
  try {
    const { taskId } = req.body;
    const task = await taskService.moveTaskToOpenWeek(taskId);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getCurrentWeek,
  closeWeek,
  getAllWeeks,
  getWeekTasks,
  moveTaskToOpenWeek,
};