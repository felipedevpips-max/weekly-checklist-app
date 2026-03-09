const weekService = require("../services/weekService");
const taskService = require("../services/taskService");

// Semana atual
async function getCurrentWeek(req, res) {
  try {
    const userId = req.userId;


    const data = await weekService.getCurrentWeekWithTasks(userId);

    if (!data) {
      return res
        .status(404)
        .json({ message: "Nenhuma semana ativa encontrada" });
    }

    res.json(data);
  } catch (err) {
    console.error("GET CURRENT WEEK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// Fechar semana
async function closeWeek(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await weekService.closeWeek(Number(id), userId);

    res.json(result);
  } catch (err) {
    console.error("CLOSE WEEK ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

// Histórico de semanas fechadas
async function getAllWeeks(req, res) {
  try {
    const userId = req.userId;

    const weeks = await weekService.getClosedWeeks(userId);

    res.json(weeks);
  } catch (err) {
    console.error("GET WEEKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// Tasks de uma semana específica
async function getWeekTasks(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const tasks = await weekService.getWeekTasks(Number(id), userId);

    res.json(tasks);
  } catch (err) {
    console.error("GET WEEK TASKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// Mover task para semana aberta
async function moveTaskToOpenWeek(req, res) {
  try {
    const userId = req.userId;
    const { taskId } = req.body;

    const task = await taskService.moveTaskToOpenWeek(taskId, userId);

    res.json(task);
  } catch (err) {
    console.error("MOVE TASK OPEN WEEK ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

// Mover task de volta para semana específica
async function moveTaskBackToWeek(req, res) {
  try {
    const userId = req.userId;
    const { taskId, weekId } = req.body;

    const task = await taskService.moveTaskToWeek(taskId, weekId, userId);

    res.json(task);
  } catch (err) {
    console.error("MOVE TASK BACK ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getCurrentWeek,
  closeWeek,
  getAllWeeks,
  getWeekTasks,
  moveTaskBackToWeek,
  moveTaskToOpenWeek,
};
