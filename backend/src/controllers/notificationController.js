// backend/controllers/notificationController.js
const taskService = require("../services/taskService");
const authService = require("../services/authService");
const { notifyTaskCreated, emailEnabled, twilioEnabled } = require("../services/notificationService");

// Envia notificação manual para uma task
async function sendNotification(req, res) {
  try {
    const userId = req.userId;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: "taskId é obrigatório" });
    }

    const tasks = await taskService.getTasks(userId);
    const task = tasks.find((t) => t.id === Number(taskId));
    if (!task) return res.status(404).json({ error: "Task não encontrada" });

    if (!task.notify) {
      return res.json({ message: "Notificações desativadas para esta task" });
    }

    const user = await authService.getUserById(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    await notifyTaskCreated({ user, task });

    return res.json({
      message: "Notificação enviada com sucesso",
      channels: {
        email: emailEnabled(),
        whatsapp: twilioEnabled() && !!user.phone,
      },
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return res.status(500).json({ error: "Erro ao enviar notificação" });
  }
}

// Retorna status dos canais de notificação configurados
async function getNotificationStatus(req, res) {
  return res.json({
    email: emailEnabled(),
    whatsapp: twilioEnabled(),
  });
}

module.exports = { sendNotification, getNotificationStatus };
