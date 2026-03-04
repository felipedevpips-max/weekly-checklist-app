const pool = require("../config/db");

// ------------------------
// Gerar datas da semana
// ------------------------
function getWeekDates(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - baseDate.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// ------------------------
// Garantir semana ativa
// ------------------------
async function ensureActiveWeek() {
  const result = await pool.query(
    `SELECT * FROM weeks WHERE closed = false ORDER BY start_date DESC LIMIT 1`
  );

  if (result.rows.length === 0) {
    const { start, end } = getWeekDates();
    const newWeek = await pool.query(
      `INSERT INTO weeks (start_date, end_date, closed)
       VALUES ($1, $2, false) RETURNING *`,
      [start, end]
    );
    return newWeek.rows[0];
  }

  const currentWeek = result.rows[0];
  const now = new Date();
  const endDate = new Date(currentWeek.end_date);

  if (now > endDate) {
    const { newWeekId } = await closeWeek(currentWeek.id);
    const newWeek = await pool.query(`SELECT * FROM weeks WHERE id = $1`, [newWeekId]);
    return newWeek.rows[0];
  }

  return currentWeek;
}

// ------------------------
// Fechar semana manualmente
// ------------------------
async function closeWeek(weekId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const weekRes = await client.query(`SELECT * FROM weeks WHERE id = $1 AND closed = false`, [weekId]);
    if (!weekRes.rows.length) throw new Error("Semana não encontrada ou já fechada");

    const currentWeek = weekRes.rows[0];
    const nextWeekBase = new Date(currentWeek.end_date);
    nextWeekBase.setDate(nextWeekBase.getDate() + 1);
    const { start, end } = getWeekDates(nextWeekBase);

    // Criar nova semana
    const newWeekRes = await client.query(
      `INSERT INTO weeks (start_date, end_date, closed) VALUES ($1, $2, false) RETURNING *`,
      [start, end]
    );
    const newWeekId = newWeekRes.rows[0].id;

    // Mover tasks pendentes para nova semana
    await client.query(
      `UPDATE tasks SET week_id = $1 WHERE week_id = $2 AND status != 'done'`,
      [newWeekId, weekId]
    );

    // Fechar semana atual
    await client.query(`UPDATE weeks SET closed = true WHERE id = $1`, [weekId]);

    await client.query("COMMIT");
    return { message: "Semana fechada com sucesso", newWeekId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ------------------------
// Buscar semana atual com tasks
// ------------------------
async function getCurrentWeekWithTasks() {
  const week = await ensureActiveWeek();
  const tasksRes = await pool.query(
    `SELECT t.*, w.closed as week_closed, w.start_date, w.end_date
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.week_id = $1 ORDER BY t.id ASC`,
    [week.id]
  );

  return { week, tasks: tasksRes.rows };
}

// ------------------------
// Buscar histórico
// ------------------------
async function getAllWeeks() {
  const res = await pool.query(`SELECT * FROM weeks ORDER BY start_date DESC`);
  return res.rows;
}

// ------------------------
// Buscar tasks de uma semana
// ------------------------
async function getWeekTasks(weekId) {
  const res = await pool.query(
    `SELECT t.*, w.closed as week_closed, w.start_date, w.end_date
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.week_id = $1 ORDER BY t.id ASC`,
    [weekId]
  );
  return res.rows;
}

// ------------------------
// Mover task para semana aberta
// ------------------------
async function moveTaskToOpenWeek(taskId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const taskRes = await client.query(`SELECT * FROM tasks WHERE id = $1`, [taskId]);
    if (!taskRes.rows.length) throw new Error("Task não encontrada");

    const task = taskRes.rows[0];
    const activeWeek = await ensureActiveWeek();

    await client.query(
      `UPDATE tasks SET week_id = $1, status = 'pending' WHERE id = $2`,
      [activeWeek.id, taskId]
    );

    await client.query("COMMIT");
    return { ...task, week_id: activeWeek.id, status: "pending" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  ensureActiveWeek,
  closeWeek,
  getCurrentWeekWithTasks,
  getAllWeeks,
  getWeekTasks,
  moveTaskToOpenWeek,
};