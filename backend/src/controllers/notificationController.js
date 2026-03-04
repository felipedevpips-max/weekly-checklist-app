// backend/controllers/notificationController.js
const taskService = require("../services/taskService");

// Simulação do envio de notificação (email/WhatsApp)
async function sendNotification(req, res) {
  try {
    const { taskId, message } = req.body;

    if (!taskId || !message) {
      return res.status(400).json({ error: "taskId e message são obrigatórios" });
    }

    // Buscar task
    const tasks = await taskService.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).json({ error: "Task não encontrada" });

    // Só envia se a task estiver marcada para notify
    if (task.notify) {
      // Aqui você integraria com email/WhatsApp real
      console.log(`🔔 Notificação para Task "${task.title}": ${message}`);
    }

    return res.json({ message: "Notificação enviada (ou ignorada se notify=false)" });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return res.status(500).json({ error: "Erro ao enviar notificação" });
  }
}

module.exports = { sendNotification };