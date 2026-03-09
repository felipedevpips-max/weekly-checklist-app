const pool = require("../config/db");

// =============================
// 📅 GERAR DATAS FIXAS DA SEMANA
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
// 🔒 FECHAR SEMANA
// =============================
async function closeWeek(weekId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const weekResult = await client.query(
      `SELECT * FROM weeks 
       WHERE id=$1 AND user_id=$2 AND closed=false`,
      [weekId, userId],
    );

    if (!weekResult.rows.length)
      throw new Error("Semana não encontrada ou já fechada");

    const currentWeek = weekResult.rows[0];

    await client.query(
      `UPDATE weeks SET closed=true 
       WHERE id=$1 AND user_id=$2`,
      [weekId, userId],
    );

    const nextWeekBase = new Date(currentWeek.end_date);
    nextWeekBase.setDate(nextWeekBase.getDate() + 1);

    const { start, end } = getWeekDates(nextWeekBase);

    const newWeekResult = await client.query(
      `INSERT INTO weeks (start_date,end_date,closed,user_id)
       VALUES ($1,$2,false,$3)
       RETURNING *`,
      [start, end, userId],
    );

    const newWeekId = newWeekResult.rows[0].id;

    const moveResult = await client.query(
      `UPDATE tasks
       SET week_id=$1,
           status='pending'
       WHERE week_id=$2
       AND user_id=$3
       AND status='in_progress'
       AND deleted_at IS NULL`,
      [newWeekId, weekId, userId],
    );

    await client.query("COMMIT");

    return {
      message: "Semana fechada com sucesso",
      newWeekId,
      movedCount: moveResult.rowCount,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// =============================
// 🧠 GARANTIR SEMANA ATIVA
// =============================
async function ensureActiveWeek(userId) {
  const result = await pool.query(
    `SELECT *
     FROM weeks
     WHERE closed=false
     AND user_id=$1
     ORDER BY start_date DESC
     LIMIT 1`,
    [userId],
  );

  if (result.rows.length === 0) {
    const { start, end } = getWeekDates();

    const newWeek = await pool.query(
      `INSERT INTO weeks (start_date,end_date,closed,user_id)
       VALUES ($1,$2,false,$3)
       RETURNING *`,
      [start, end, userId],
    );

    return newWeek.rows[0];
  }

  return result.rows[0];
}

// =============================
// 📋 SEMANA ATUAL COM TASKS
// =============================
async function getCurrentWeekWithTasks(userId) {
  const week = await ensureActiveWeek(userId);

  const tasksResult = await pool.query(
    `SELECT t.*, w.closed as week_closed
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.week_id=$1
     AND t.user_id=$2
     AND t.deleted_at IS NULL
     ORDER BY t.id ASC`,
    [week.id, userId],
  );

  return { week, tasks: tasksResult.rows };
}

// =============================
// 📚 HISTÓRICO SEMANAS
// =============================
async function getAllWeeks(userId) {
  const result = await pool.query(
    `SELECT * FROM weeks
     WHERE user_id=$1
     ORDER BY start_date DESC`,
    [userId],
  );

  return result.rows;
}

async function getClosedWeeks(userId) {
  const result = await pool.query(
    `SELECT * FROM weeks
     WHERE user_id=$1
     AND closed=true
     ORDER BY start_date DESC`,
    [userId],
  );

  return result.rows;
}

// =============================
// 📚 TASKS DE UMA SEMANA
// =============================
async function getWeekTasks(weekId, userId) {
  const result = await pool.query(
    `SELECT *
     FROM tasks
     WHERE week_id=$1
     AND user_id=$2
     AND deleted_at IS NULL
     ORDER BY id ASC`,
    [weekId, userId],
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
