const { pool } = require("../database/connection");

async function createTask(data) {
  const result = await pool.query(
    `INSERT INTO tasks 
     (title, description, priority, status, due_date) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.title, data.description, data.priority, data.status, data.dueDate]
  );

  return result.rows[0];
}

async function getTasks(weekId) {
  if (weekId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE week_id = $1 ORDER BY created_at DESC",
      [weekId]
    );
    return result.rows;
  }

  const result = await pool.query(
    "SELECT * FROM tasks ORDER BY created_at DESC"
  );
  return result.rows;
}

module.exports = { createTask, getTasks };