const taskService = require("../services/taskService");

function createTask(req, res) {
  const { title, priority, progress } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = taskService.createTask({ title, priority, progress });

  return res.status(201).json(task);
}

function getTasks(req, res) {
  const tasks = taskService.getTasks();
  return res.json(tasks);
}

function deleteTask(req, res) {
  const { id } = req.params;

  const deleted = taskService.deleteTask(Number(id));

  if (!deleted) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.status(204).send();
}

module.exports = {
  createTask,
  getTasks,
  deleteTask,
};
