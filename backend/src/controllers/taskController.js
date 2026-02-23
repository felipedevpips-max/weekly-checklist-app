const taskService = require("../services/taskService");

function createTask(req, res) {
  const { title, priority, status, progress, description, notify, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const task = taskService.createTask({ title, priority, status, progress, description, notify, dueDate });
  return res.status(201).json(task);
}

function getTasks(req, res) {
  const { weekId } = req.query;
  const tasks = taskService.getTasks(weekId ? Number(weekId) : null);
  return res.json(tasks);
}

function updateTask(req, res) {
  const { id } = req.params;
  const updatedTask = taskService.updateTask(Number(id), req.body);
  if (!updatedTask) return res.status(404).json({ message: "Task not found" });
  return res.json(updatedTask);
}

function deleteTask(req, res) {
  const { id } = req.params;
  const deleted = taskService.deleteTask(Number(id));
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  return res.status(204).send();
}

function closeWeek(req, res) {
  const closed = taskService.closeCurrentWeek();
  if (!closed) return res.status(400).json({ message: "Week already closed" });
  return res.json({ message: "Week closed and pending tasks moved" });
}

module.exports = { createTask, getTasks, updateTask, deleteTask, closeWeek };