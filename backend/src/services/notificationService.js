// backend/src/services/notificationService.js
require("dotenv").config();

function emailEnabled() {
  return !!process.env.RESEND_API_KEY;
}
function twilioEnabled() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
}

let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const { Resend } = require("resend");
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

let _twilio = null;
function getTwilio() {
  if (_twilio) return _twilio;
  const twilio = require("twilio");
  _twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return _twilio;
}

function normalizePhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return `whatsapp:${cleaned}`;
}

async function sendEmail({ to, subject, html, text }) {
  if (!emailEnabled()) {
    console.log(`[Notification] Email desabilitado. Para: ${to} | ${subject}`);
    return false;
  }
  try {
    const { error } = await getResend().emails.send({
      from: process.env.RESEND_FROM || "WeekTask <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message);
    console.log(`[Notification] ✅ Email enviado → ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[Notification] ❌ Email falhou → ${to}:`, err.message);
    return false;
  }
}

async function sendWhatsApp({ to, body }) {
  if (!twilioEnabled()) {
    console.log(`[Notification] WhatsApp desabilitado. Para: ${to}`);
    return false;
  }
  const toFormatted = normalizePhone(to);
  if (!toFormatted) return false;
  try {
    await getTwilio().messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toFormatted,
      body,
    });
    console.log(`[Notification] ✅ WhatsApp enviado → ${toFormatted}`);
    return true;
  } catch (err) {
    console.error(`[Notification] ❌ WhatsApp falhou → ${toFormatted}:`, err.message);
    return false;
  }
}

// ════════════════════════════════════════
// 1. BOAS-VINDAS NO CADASTRO
// ════════════════════════════════════════
async function notifyWelcome({ name, email, phone }) {
  const subject = "Bem-vindo(a) ao WeekTask! 🎉";
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#034ba3;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">WeekTask</h1>
      </div>
      <h2 style="color:#1e293b;margin-top:0;">Olá, ${name}! 👋</h2>
      <p style="color:#475569;line-height:1.6;">
        Sua conta foi criada com sucesso. Agora você pode organizar suas semanas,
        acompanhar tarefas e manter o foco no que realmente importa.
      </p>
      <a href="${process.env.APP_URL || "http://localhost:5173"}"
         style="display:inline-block;margin-top:16px;padding:12px 24px;background:#034ba3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
        Acessar o WeekTask →
      </a>
    </div>`;
  await Promise.allSettled([
    sendEmail({ to: email, subject, html, text: `Olá ${name}! Conta criada no WeekTask.` }),
    phone ? sendWhatsApp({ to: phone, body: `🎉 Olá ${name}! Sua conta no *WeekTask* foi criada.\nAcesse: ${process.env.APP_URL || "http://localhost:5173"}` }) : Promise.resolve(),
  ]);
}

// ════════════════════════════════════════
// 2. TASK CRIADA COM notify = true
// ════════════════════════════════════════
async function notifyTaskCreated({ user, task }) {
  if (!task.notify) return;
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "—";
  const priorityLabel = { low: "Baixa", medium: "Média", high: "Alta" }[task.priority] || task.priority;
  const subject = `📋 Nova tarefa criada: "${task.title}"`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#034ba3;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">WeekTask</h1>
      </div>
      <h2 style="color:#1e293b;margin-top:0;">Nova tarefa criada 📋</h2>
      <div style="background:#fff;border-radius:8px;padding:20px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1e293b;">${task.title}</p>
        ${task.description ? `<p style="color:#475569;margin:0 0 12px;">${task.description}</p>` : ""}
        <span style="background:#eff6ff;color:#2563eb;padding:4px 10px;border-radius:20px;font-size:13px;margin-right:8px;">Prioridade: ${priorityLabel}</span>
        <span style="background:#f0fdf4;color:#16a34a;padding:4px 10px;border-radius:20px;font-size:13px;">Encerra: ${dueDate}</span>
      </div>
    </div>`;
  await Promise.allSettled([
    sendEmail({ to: user.email, subject, html }),
    user.phone ? sendWhatsApp({ to: user.phone, body: `📋 *Nova tarefa criada!*\n\n*${task.title}*\n${task.description || ""}\n\n📌 Prioridade: ${priorityLabel}\n📅 Encerra: ${dueDate}` }) : Promise.resolve(),
  ]);
}

// ════════════════════════════════════════
// 3. NOTIFY ATIVADO AO EDITAR TASK
// ════════════════════════════════════════
async function notifyTaskToggle({ user, task }) {
  if (!task.notify) return;
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "—";
  const subject = `🔔 Notificações ativadas: "${task.title}"`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#034ba3;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">WeekTask</h1>
      </div>
      <h2 style="color:#1e293b;margin-top:0;">Notificações ativadas 🔔</h2>
      <p style="color:#475569;line-height:1.6;">
        Você ativou as notificações para <strong>"${task.title}"</strong>.<br>
        Você receberá lembretes até o prazo de <strong>${dueDate}</strong>.
      </p>
    </div>`;
  await Promise.allSettled([
    sendEmail({ to: user.email, subject, html }),
    user.phone ? sendWhatsApp({ to: user.phone, body: `🔔 Notificações ativadas para *"${task.title}"*\n📅 Prazo: ${dueDate}` }) : Promise.resolve(),
  ]);
}

// ════════════════════════════════════════
// 4. RESUMO DO FECHAMENTO AUTOMÁTICO DA SEMANA
// ════════════════════════════════════════
async function notifyWeekClosed({ user, pendingTasks, weekEnd }) {
  if (!pendingTasks || pendingTasks.length === 0) return;
  const dateStr = weekEnd ? new Date(weekEnd).toLocaleDateString("pt-BR") : "—";
  const subject = `📅 Semana encerrada — ${pendingTasks.length} tarefa(s) pendente(s)`;
  const taskListHtml = pendingTasks.map(t => `
    <li style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#475569;">
      <strong style="color:#1e293b;">${t.title}</strong>
      ${t.status === "in_progress" ? ' <span style="background:#fef9c3;color:#a16207;padding:2px 8px;border-radius:10px;font-size:12px;">Em andamento</span>' : ' <span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:12px;">Pendente</span>'}
    </li>`).join("");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#034ba3;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">WeekTask</h1>
      </div>
      <h2 style="color:#1e293b;margin-top:0;">Semana encerrada 📅</h2>
      <p style="color:#475569;">A semana de <strong>${dateStr}</strong> foi encerrada automaticamente. Você tem <strong>${pendingTasks.length} tarefa(s)</strong> não concluída(s):</p>
      <ul style="list-style:none;padding:0;margin:16px 0;">${taskListHtml}</ul>
      <p style="color:#475569;">Essas tarefas foram movidas para a nova semana. Bora concluir!</p>
      <a href="${process.env.APP_URL || "http://localhost:5173"}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#034ba3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
        Ver nova semana →
      </a>
    </div>`;
  const taskListText = pendingTasks.map(t => `• ${t.title} (${t.status === "in_progress" ? "Em andamento" : "Pendente"})`).join("\n");
  await Promise.allSettled([
    sendEmail({ to: user.email, subject, html }),
    user.phone ? sendWhatsApp({ to: user.phone, body: `📅 *Semana encerrada!*\n\nVocê tem *${pendingTasks.length} tarefa(s)* não concluída(s):\n\n${taskListText}\n\nElas foram movidas para a nova semana. Bora lá! 💪` }) : Promise.resolve(),
  ]);
}

// ════════════════════════════════════════
// 5. LEMBRETE NA VÉSPERA DO ENCERRAMENTO (sexta-feira)
// ════════════════════════════════════════
async function notifyWeekEnding({ user, pendingTasks, weekEnd }) {
  if (!pendingTasks || pendingTasks.length === 0) return;
  const dateStr = weekEnd ? new Date(weekEnd).toLocaleDateString("pt-BR") : "—";
  const subject = `⏰ A semana encerra amanhã — ${pendingTasks.length} tarefa(s) pendente(s)`;
  const taskListHtml = pendingTasks.map(t => `<li style="color:#475569;padding:4px 0;"><strong>${t.title}</strong></li>`).join("");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#d97706;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">⏰ WeekTask — Lembrete</h1>
      </div>
      <h2 style="color:#1e293b;margin-top:0;">A semana encerra amanhã!</h2>
      <p style="color:#475569;">Sua semana encerra em <strong>${dateStr}</strong> e você ainda tem <strong>${pendingTasks.length} tarefa(s)</strong> pendente(s):</p>
      <ul style="list-style:none;padding:0;margin:16px 0;">${taskListHtml}</ul>
      <a href="${process.env.APP_URL || "http://localhost:5173"}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#d97706;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
        Concluir tarefas →
      </a>
    </div>`;
  const taskListText = pendingTasks.map(t => `• ${t.title}`).join("\n");
  await Promise.allSettled([
    sendEmail({ to: user.email, subject, html }),
    user.phone ? sendWhatsApp({ to: user.phone, body: `⏰ *A semana encerra amanhã (${dateStr})!*\n\nVocê tem *${pendingTasks.length} tarefa(s)* pendente(s):\n\n${taskListText}\n\nAinda dá tempo de concluir! 🚀` }) : Promise.resolve(),
  ]);
}

module.exports = {
  notifyWelcome,
  notifyTaskCreated,
  notifyTaskToggle,
  notifyWeekClosed,
  notifyWeekEnding,
  emailEnabled,
  twilioEnabled,
};
