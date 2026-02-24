const pool = require("../config/db");

// 🔎 Buscar semana atual com tasks
async function getCurrentWeekWithTasks() {
  // 🔥 GARANTE que sempre existe semana válida
  const week = await ensureActiveWeek();

  const tasksResult = await pool.query(
    `SELECT * FROM tasks
     WHERE week_id = $1`,
    [week.id],
  );

  return {
    week,
    tasks: tasksResult.rows,
  };
}

// 🔐 Fecha semana manualmente (caso queira usar endpoint)
async function closeWeek(weekId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const weekResult = await client.query(
      "SELECT * FROM weeks WHERE id = $1 AND closed = false",
      [weekId],
    );

    if (weekResult.rows.length === 0) {
      throw new Error("Semana não encontrada ou já fechada");
    }

    const currentWeek = weekResult.rows[0];

    // Criar próxima semana baseada no end_date da atual
    const newStartDate = new Date(currentWeek.end_date);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 7);

    const newWeekResult = await client.query(
      `INSERT INTO weeks (start_date, end_date, closed)
       VALUES ($1, $2, false)
       RETURNING *`,
      [newStartDate, newEndDate],
    );

    const newWeekId = newWeekResult.rows[0].id;

    // Mover tasks pendentes
    await client.query(
      `UPDATE tasks
       SET week_id = $1
       WHERE week_id = $2
       AND status != 'done'`,
      [newWeekId, weekId],
    );

    // Fechar semana atual
    await client.query("UPDATE weeks SET closed = true WHERE id = $1", [
      weekId,
    ]);

    await client.query("COMMIT");

    return {
      message: "Semana fechada com sucesso",
      newWeekId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 🧠 FUNÇÃO PRINCIPAL (Substitui cron)
async function ensureActiveWeek() {
  // 1️⃣ Buscar semana aberta
  const result = await pool.query(
    `SELECT * FROM weeks
     WHERE closed = false
     ORDER BY start_date DESC
     LIMIT 1`,
  );

  // 2️⃣ Se não existir nenhuma → criar primeira
  if (result.rows.length === 0) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const newWeek = await pool.query(
      `INSERT INTO weeks (start_date, end_date, closed)
       VALUES ($1, $2, false)
       RETURNING *`,
      [startDate, endDate],
    );

    return newWeek.rows[0];
  }

  const currentWeek = result.rows[0];

  const today = new Date();
  const endDate = new Date(currentWeek.end_date);

  // 3️⃣ Se venceu → fechar automaticamente
  if (today > endDate) {
    // reutiliza sua função closeWeek
    const result = await closeWeek(currentWeek.id);

    // buscar nova semana criada
    const newWeekResult = await pool.query(
      `SELECT * FROM weeks WHERE id = $1`,
      [result.newWeekId],
    );

    return newWeekResult.rows[0];
  }

  return currentWeek;
}

module.exports = {
  getCurrentWeekWithTasks,
  closeWeek,
  ensureActiveWeek,
};
