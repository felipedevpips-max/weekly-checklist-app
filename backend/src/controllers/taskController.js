const taskService = require("../services/taskService");

// CREATE
async function createTask(req, res) {
  try {
    const {
      title,
      priority,
      status,
      description,
      dueDate,
      notify, // ✅ agora recebe notify
    } = req.body;

    console.log("BODY RECEBIDO:", req.body);

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = await taskService.createTask({
      title,
      priority: priority || "low",
      status: status || "pending",
      description: description || "",
      dueDate,
      notify: notify || false, // ✅ salva notify
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      error: "Erro ao criar task",
    });
  }
}

// GET
async function getTasks(req, res) {
  try {
    const { weekId } = req.query;

    const tasks = await taskService.getTasks(weekId ? Number(weekId) : null);

    return res.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return res.status(500).json({
      error: "Erro ao buscar tasks",
    });
  }
}

// UPDATE
async function updateTask(req, res) {
  try {
    const { id } = req.params;

    const { title, priority, status, description, dueDate, notify } = req.body;

    const updatedTask = await taskService.updateTask(Number(id), {
      title,
      priority,
      status,
      description,
      dueDate,
      notify, // ✅ suporta update notify
    });

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return res.status(500).json({
      error: "Erro ao atualizar task",
    });
  }
}

// DELETE
async function deleteTask(req, res) {
  console.log("DELETE ID:", req.params.id);
  try {
    const { id } = req.params;

    await taskService.deleteTask(Number(id));

    return res.json({
      message: "Task deletada com sucesso",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return res.status(500).json({
      error: "Erro ao deletar task",
    });
  }
}

// CLOSE WEEK
async function closeWeek(req, res) {
  try {
    await taskService.closeCurrentWeek();

    return res.json({
      message: "Week closed successfully",
    });
  } catch (error) {
    console.error("CLOSE WEEK ERROR:", error);

    return res.status(500).json({
      error: "Erro ao fechar semana",
    });
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  closeWeek,
};
