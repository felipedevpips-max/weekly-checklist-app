const weekService = require("../services/weekService");

async function getCurrentWeek(req, res) {
  try {
    const data = await weekService.getCurrentWeekWithTasks();

    if (!data) {
      return res.status(404).json({
        message: "Nenhuma semana ativa encontrada"
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

module.exports = {
  getCurrentWeek
};