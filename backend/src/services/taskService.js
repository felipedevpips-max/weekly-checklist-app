const pool = require("../config/db");
const { ensureActiveWeek } = require("./weekService");

const allowedStatus = ["pending", "in_progress", "done"];
const allowedPriority = ["low", "medium", "high"];

// ----------------------------
// CRIAR TASK
// ----------------------------
async function createTask(data) {
  const week = await ensureActiveWeek();
  const status = data.status || "pending";
  const priority = data.priority || "low";
  const notify = data.notify === true;
  const dueDate = data.dueDate || data.due_date || week.end_date;

  const result = await pool.query(
    `INSERT INTO tasks (title, description, priority, status, notify, due_date, week_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.title, data.description || "", priority, status, notify, dueDate, week.id]
  );

  return result.rows[0];
}

// ----------------------------
// LISTAR TASKS DE UMA SEMANA
// ----------------------------
async function getTasksByWeek(weekId) {
  const result = await pool.query(
    `SELECT * FROM tasks WHERE week_id = $1 ORDER BY id ASC`,
    [weekId]
  );
  return result.rows;
}

// ----------------------------
// UPDATE TASK
// ----------------------------
async function updateTask(id, data) {
  const checkResult = await pool.query(
    `SELECT w.closed FROM tasks t JOIN weeks w ON w.id = t.week_id WHERE t.id = $1`,
    [id]
  );
  if (!checkResult.rows.length) throw new Error("Task not found");
  if (checkResult.rows[0].closed) throw new Error("Week closed");

  if (data.status && !allowedStatus.includes(data.status)) throw new Error("Invalid status");
  if (data.priority && !allowedPriority.includes(data.priority)) throw new Error("Invalid priority");

  const result = await pool.query(
    `UPDATE tasks SET
       title = COALESCE($1,title),
       description = COALESCE($2,description),
       priority = COALESCE($3,priority),
       status = COALESCE($4,status),
       notify = COALESCE($5,notify),
       due_date = COALESCE($6,due_date)
     WHERE id = $7 RETURNING *`,
    [data.title, data.description, data.priority, data.status, data.notify, data.dueDate, id]
  );

  return result.rows[0];
}

// ----------------------------
// DELETE TASK
// ----------------------------
async function deleteTask(id) {
  const checkResult = await pool.query(
    `SELECT w.closed FROM tasks t JOIN weeks w ON w.id = t.week_id WHERE t.id = $1`,
    [id]
  );
  if (!checkResult.rows.length) throw new Error("Task not found");
  if (checkResult.rows[0].closed) throw new Error("Week closed");

  await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
  return true;
}

// ----------------------------
// MOVE TASK PARA SEMANA ABERTA
// ----------------------------
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
  createTask,
  getTasksByWeek,
  updateTask,
  deleteTask,
  moveTaskToOpenWeek,
};