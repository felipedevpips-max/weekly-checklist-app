const weekService = require("../services/weekService");

// 🔹 Semana atual
async function getCurrentWeek(req, res) {
  try {
    const data = await weekService.getCurrentWeekWithTasks();

    if (!data) {
      return res.status(404).json({
        message: "Nenhuma semana ativa encontrada",
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}

// 🔹 Fechar semana
async function closeWeek(req, res) {
  try {
    const { id } = req.params;

    const result = await weekService.closeWeek(id);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

// 🔹 Histórico: todas as semanas
async function getAllWeeks(req, res) {
  try {
    const weeks = await weekService.getAllWeeks();
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 🔹 Histórico: tasks de uma semana específica
async function getWeekTasks(req, res) {
  try {
    const { id } = req.params;
    const tasks = await weekService.getWeekTasks(Number(id));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCurrentWeek,
  closeWeek,
  getAllWeeks, // adiciona para rota GET /weeks
  getWeekTasks, // adiciona para rota GET /weeks/:id/tasks
};
