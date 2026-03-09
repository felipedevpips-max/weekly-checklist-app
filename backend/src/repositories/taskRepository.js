const { pool } = require("../database/connection");

// CREATE TASK
async function createTask(data, userId) {
  const result = await pool.query(
    `INSERT INTO tasks 
    (title, description, priority, status, due_date, notify, week_id, user_id) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.dueDate,
      data.notify,
      data.weekId,
      userId,
    ],
  );

  return result.rows[0];
}

// GET TASKS
async function getTasks(userId, weekId) {
  if (weekId) {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id = $1 AND week_id = $2
       ORDER BY created_at DESC`,
      [userId, weekId],
    );

    return result.rows;
  }

  const result = await pool.query(
    `SELECT * FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
}

// GET TASK BY ID
async function getTaskById(id, userId) {
  const result = await pool.query(
    `SELECT * FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
}

// UPDATE TASK
async function updateTask(id, userId, data) {
  const result = await pool.query(
    `UPDATE tasks
     SET
       title = $1,
       description = $2,
       priority = $3,
       status = $4,
       due_date = $5,
       notify = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.dueDate,
      data.notify,
      id,
      userId,
    ],
  );

  return result.rows[0];
}

// DELETE TASK
async function deleteTask(id, userId) {
  await pool.query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
}

// CLOSE WEEK
async function closeCurrentWeek(userId) {
  const result = await pool.query(
    `UPDATE tasks
     SET week_closed = true
     WHERE user_id = $1`,
    [userId],
  );

  return result.rowCount;
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  closeCurrentWeek,
};
