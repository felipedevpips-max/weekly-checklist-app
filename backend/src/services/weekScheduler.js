// backend/src/services/weekScheduler.js
//
// Scheduler automático de semanas:
// - Todo sábado às 23:59 → fecha semanas cujo end_date chegou, notifica usuários
// - Toda sexta às 09:00  → lembrete de véspera para tasks pendentes
//
// Requer: npm install node-cron

const cron = require("node-cron");
const { pool } = require("../database/connection");
const { notifyWeekClosed, notifyWeekEnding } = require("./notificationService");

// ─────────────────────────────────────────────
// Busca todos os usuários com semana aberta
// cujo end_date já passou (ou é hoje sábado)
// ─────────────────────────────────────────────
async function getUsersWithExpiredWeeks() {
  const result = await pool.query(`
    SELECT DISTINCT u.id, u.name, u.email, u.phone, w.id as week_id, w.end_date
    FROM weeks w
    JOIN users u ON u.id = w.user_id
    WHERE w.closed = false
      AND w.end_date <= NOW()
  `);
  return result.rows;
}

// ─────────────────────────────────────────────
// Busca usuários com semana que encerra amanhã
// e ainda têm tasks pendentes/em andamento
// ─────────────────────────────────────────────
async function getUsersWithWeekEndingTomorrow() {
  const result = await pool.query(`
    SELECT DISTINCT u.id, u.name, u.email, u.phone, w.id as week_id, w.end_date
    FROM weeks w
    JOIN users u ON u.id = w.user_id
    WHERE w.closed = false
      AND DATE(w.end_date) = CURRENT_DATE + INTERVAL '1 day'
  `);
  return result.rows;
}

// ─────────────────────────────────────────────
// Busca tasks pendentes/em andamento de uma semana
// (só as que têm notify = true OU todas — escolhemos todas
//  pois é um resumo de fechamento, independente do notify)
// ─────────────────────────────────────────────
async function getPendingTasksForWeek(weekId, userId) {
  const result = await pool.query(`
    SELECT * FROM tasks
    WHERE week_id = $1
      AND user_id = $2
      AND status IN ('pending', 'in_progress')
      AND deleted_at IS NULL
  `, [weekId, userId]);
  return result.rows;
}

// ─────────────────────────────────────────────
// Fecha uma semana e cria a próxima
// (mesma lógica do weekService.closeWeek)
// ─────────────────────────────────────────────
async function autoCloseWeek(weekId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const weekRes = await client.query(
      `SELECT * FROM weeks WHERE id=$1 AND user_id=$2 AND closed=false`,
      [weekId, userId]
    );
    if (!weekRes.rows.length) {
      await client.query("ROLLBACK");
      return null;
    }
    const currentWeek = weekRes.rows[0];

    // Fecha a semana atual
    await client.query(
      `UPDATE weeks SET closed=true WHERE id=$1 AND user_id=$2`,
      [weekId, userId]
    );

    // Cria a nova semana (domingo a sábado seguinte)
    const nextBase = new Date(currentWeek.end_date);
    nextBase.setDate(nextBase.getDate() + 1);

    const start = new Date(nextBase);
    start.setDate(nextBase.getDate() - nextBase.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const newWeekRes = await client.query(
      `INSERT INTO weeks (start_date, end_date, closed, user_id)
       VALUES ($1, $2, false, $3) RETURNING *`,
      [start, end, userId]
    );
    const newWeekId = newWeekRes.rows[0].id;

    // Move tasks in_progress para a nova semana como pending
    await client.query(
      `UPDATE tasks
       SET week_id=$1, status='pending'
       WHERE week_id=$2 AND user_id=$3
         AND status='in_progress' AND deleted_at IS NULL`,
      [newWeekId, weekId, userId]
    );

    await client.query("COMMIT");
    return newWeekId;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`[Scheduler] Erro ao fechar semana ${weekId}:`, err.message);
    return null;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// JOB 1: Fechamento automático
// Roda todo sábado às 23:59
// ─────────────────────────────────────────────
function scheduleAutoClose() {
  // "59 23 * * 6" = sábado 23:59
  cron.schedule("59 23 * * 6", async () => {
    console.log("[Scheduler] 🔒 Iniciando fechamento automático de semanas...");
    try {
      const users = await getUsersWithExpiredWeeks();
      console.log(`[Scheduler] ${users.length} semana(s) expirada(s) encontrada(s).`);

      for (const row of users) {
        const pendingTasks = await getPendingTasksForWeek(row.week_id, row.id);
        const newWeekId = await autoCloseWeek(row.week_id, row.id);

        if (newWeekId !== null) {
          console.log(`[Scheduler] ✅ Semana ${row.week_id} fechada → nova semana ${newWeekId} (user ${row.id})`);
          // Notifica sobre tasks não concluídas (independente de notify)
          if (pendingTasks.length > 0) {
            notifyWeekClosed({
              user: { id: row.id, name: row.name, email: row.email, phone: row.phone },
              pendingTasks,
              weekEnd: row.end_date,
            }).catch(err => console.error("[Scheduler] Falha ao notificar fechamento:", err.message));
          }
        }
      }
    } catch (err) {
      console.error("[Scheduler] Erro no job de fechamento:", err.message);
    }
  }, { timezone: "America/Sao_Paulo" });

  console.log("[Scheduler] ✅ Job de fechamento automático agendado (sáb 23:59 BRT)");
}

// ─────────────────────────────────────────────
// JOB 2: Lembrete de véspera
// Roda toda sexta às 09:00
// ─────────────────────────────────────────────
function scheduleWeekEndingReminder() {
  // "0 9 * * 5" = sexta-feira 09:00
  cron.schedule("0 9 * * 5", async () => {
    console.log("[Scheduler] ⏰ Enviando lembretes de véspera...");
    try {
      const users = await getUsersWithWeekEndingTomorrow();
      console.log(`[Scheduler] ${users.length} usuário(s) com semana encerrando amanhã.`);

      for (const row of users) {
        const pendingTasks = await getPendingTasksForWeek(row.week_id, row.id);
        if (pendingTasks.length > 0) {
          notifyWeekEnding({
            user: { id: row.id, name: row.name, email: row.email, phone: row.phone },
            pendingTasks,
            weekEnd: row.end_date,
          }).catch(err => console.error("[Scheduler] Falha ao enviar lembrete:", err.message));
        }
      }
    } catch (err) {
      console.error("[Scheduler] Erro no job de lembrete:", err.message);
    }
  }, { timezone: "America/Sao_Paulo" });

  console.log("[Scheduler] ✅ Job de lembrete agendado (sex 09:00 BRT)");
}

// ─────────────────────────────────────────────
// Também fecha semanas que já expiraram
// na inicialização do servidor (catch-up)
// ─────────────────────────────────────────────
async function runCatchUpOnStart() {
  try {
    const users = await getUsersWithExpiredWeeks();
    if (users.length === 0) return;

    console.log(`[Scheduler] 🔄 Catch-up: ${users.length} semana(s) expirada(s) ao iniciar servidor.`);
    for (const row of users) {
      const pendingTasks = await getPendingTasksForWeek(row.week_id, row.id);
      const newWeekId = await autoCloseWeek(row.week_id, row.id);
      if (newWeekId !== null) {
        console.log(`[Scheduler] ✅ Catch-up: semana ${row.week_id} fechada (user ${row.id})`);
        if (pendingTasks.length > 0) {
          notifyWeekClosed({
            user: { id: row.id, name: row.name, email: row.email, phone: row.phone },
            pendingTasks,
            weekEnd: row.end_date,
          }).catch(err => console.error("[Scheduler] Falha notif catch-up:", err.message));
        }
      }
    }
  } catch (err) {
    console.error("[Scheduler] Erro no catch-up:", err.message);
  }
}

function startScheduler() {
  scheduleAutoClose();
  scheduleWeekEndingReminder();
  // Roda catch-up 3s após iniciar (dá tempo do pool conectar)
  setTimeout(runCatchUpOnStart, 3000);
}

module.exports = { startScheduler };
