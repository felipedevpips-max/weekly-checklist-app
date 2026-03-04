const weekService = require("../services/weekService");
const taskService = require("../services/taskService");

// Semana atual
async function getCurrentWeek(req, res) {
  try {
    const data = await weekService.getCurrentWeekWithTasks();
    if (!data)
      return res.status(404).json({ message: "Nenhuma semana ativa encontrada" });
    res.json(data);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

// Histórico de todas semanas fechadas
async function getAllWeeks(req, res) {
  try {
    // 🔹 aqui chamamos getAllWeeks e filtramos closed
    const weeks = await weekService.getAllWeeks();
    const closedWeeks = weeks.filter((w) => w.closed);
    res.json(closedWeeks);
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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