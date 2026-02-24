const pool = require("../config/db");

async function getCurrentWeekWithTasks() {
  const today = new Date();

  // Buscar semana atual
  const weekResult = await pool.query(
    `SELECT * FROM weeks
     WHERE start_date <= $1
     AND end_date >= $1
     LIMIT 1`,
    [today],
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

module.exports = {
  getCurrentWeekWithTasks,
};
