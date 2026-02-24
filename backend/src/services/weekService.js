const pool = require("../config/db");

async function getCurrentWeekWithTasks() {
  const today = new Date();

  // Buscar semana atual
  const weekResult = await pool.query(
    `SELECT * FROM weeks
   WHERE closed = false
   ORDER BY start_date DESC
   LIMIT 1`,
  );

  if (weekResult.rows.length === 0) {
    return null;
  }

  const week = weekResult.rows[0];

  // Buscar tasks da semana
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

async function closeWeek(weekId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Buscar semana atual
    const weekResult = await client.query(
      "SELECT * FROM weeks WHERE id = $1 AND closed = false",
      [weekId],
    );

    if (weekResult.rows.length === 0) {
      throw new Error("Semana não encontrada ou já fechada");
    }

    const currentWeek = weekResult.rows[0];

    // 2️⃣ Criar próxima semana
    const newStartDate = new Date(currentWeek.end_date);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 7);

    const newWeekResult = await client.query(
      `INSERT INTO weeks (start_date, end_date)
       VALUES ($1, $2)
       RETURNING *`,
      [newStartDate, newEndDate],
    );

    const newWeekId = newWeekResult.rows[0].id;

    // 3️⃣ Mover tasks pendentes
    await client.query(
      `UPDATE tasks
       SET week_id = $1
       WHERE week_id = $2
       AND status != 'done'`,
      [newWeekId, weekId],
    );

    // 4️⃣ Fechar semana atual
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

module.exports = {
  getCurrentWeekWithTasks,
  closeWeek,
};
