const pool = require("../config/db");

// =============================
// 📅 GERAR DATAS FIXAS DA SEMANA
// Domingo 00:00 → Sábado 23:59
// =============================
function getWeekDates(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - baseDate.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// =============================
// 🧠 GARANTIR SEMANA ATIVA
// =============================
async function ensureActiveWeek() {
  const result = await pool.query(`
    SELECT *
    FROM weeks
    WHERE closed = false
    ORDER BY start_date DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    const { start, end } = getWeekDates();
    const newWeek = await pool.query(
      `INSERT INTO weeks (start_date, end_date, closed) VALUES ($1,$2,false) RETURNING *`,
      [start, end],
    );
    return newWeek.rows[0];
  }

  const currentWeek = result.rows[0];
  const now = new Date();
  const endDate = new Date(currentWeek.end_date);

  if (now > endDate) {
    const closeResult = await closeWeek(currentWeek.id);
    const newWeek = await pool.query(`SELECT * FROM weeks WHERE id = $1`, [
      closeResult.newWeekId,
    ]);
    return newWeek.rows[0];
  }

  return currentWeek;
}

// =============================
// 🔒 FECHAR SEMANA
// =============================
async function closeWeek(weekId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const weekResult = await client.query(
      `SELECT * FROM weeks WHERE id=$1 AND closed=false`,
      [weekId],
    );

    if (!weekResult.rows.length)
      throw new Error("Semana não encontrada ou já fechada");

    const currentWeek = weekResult.rows[0];

    const nextWeekBase = new Date(currentWeek.end_date);
    nextWeekBase.setDate(nextWeekBase.getDate() + 1);

    const { start, end } = getWeekDates(nextWeekBase);

    const newWeekResult = await client.query(
      `INSERT INTO weeks (start_date,end_date,closed) VALUES ($1,$2,false) RETURNING *`,
      [start, end],
    );

    const newWeekId = newWeekResult.rows[0].id;

    // 🔹 Só atualizar tasks não deletadas
    await client.query(
      `UPDATE tasks SET week_id=$1 WHERE week_id=$2 AND status != 'done' AND deleted_at IS NULL`,
      [newWeekId, weekId],
    );

    await client.query(`UPDATE weeks SET closed=true WHERE id=$1`, [weekId]);

    await client.query("COMMIT");

    return { message: "Semana fechada com sucesso", newWeekId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// =============================
// 📋 GET SEMANA ATUAL COM TASKS
// =============================
async function getCurrentWeekWithTasks() {
  const week = await ensureActiveWeek();

  const tasksResult = await pool.query(
    `SELECT t.*, w.closed as week_closed, w.start_date, w.end_date
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.week_id=$1 AND t.deleted_at IS NULL
     ORDER BY t.id ASC`,
    [week.id],
  );

  return { week, tasks: tasksResult.rows };
}

// =============================
// 📚 HISTÓRICO SEMANAS
// =============================
async function getAllWeeks() {
  const result = await pool.query(
    `SELECT * FROM weeks ORDER BY start_date DESC`,
  );
  return result.rows;
}

async function getClosedWeeks() {
  const result = await pool.query(
    `SELECT * FROM weeks WHERE closed=true ORDER BY start_date DESC`,
  );
  return result.rows;
}

// =============================
// 📚 TASKS DE UMA SEMANA
// =============================
async function getWeekTasks(weekId) {
  const result = await pool.query(
    `SELECT t.*, w.closed as week_closed, w.start_date, w.end_date
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.week_id=$1 AND t.deleted_at IS NULL
     ORDER BY t.id ASC`,
    [weekId],
  );
  return result.rows;
}

module.exports = {
  ensureActiveWeek,
  closeWeek,
  getCurrentWeekWithTasks,
  getAllWeeks,
  getClosedWeeks,
  getWeekTasks,
};
