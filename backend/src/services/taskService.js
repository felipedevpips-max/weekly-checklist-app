const pool = require("../config/db");
const { ensureActiveWeek } = require("./weekService");

const allowedStatus = ["pending", "in_progress", "done"];
const allowedPriority = ["low", "medium", "high"];

// ----------------------------
// CRIAR TASK
// ----------------------------
async function createTask(data, userId) {
  const week = await ensureActiveWeek(userId);

  const status = data.status || "pending";
  const priority = data.priority || "low";
  const notify = data.notify === true;
  const dueDate = data.dueDate || data.due_date || week.end_date;

  const result = await pool.query(
    `INSERT INTO tasks
      (title, description, priority, status, notify, due_date, week_id, user_id, archived)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false)
     RETURNING *`,
    [
      data.title,
      data.description || "",
      priority,
      status,
      notify,
      dueDate,
      week.id,
      userId,
    ],
  );

  return result.rows[0];
}

// ----------------------------
// LISTAR TASKS
// ----------------------------
async function getTasks(userId, weekId = null) {
  const whereClause = weekId
    ? `WHERE week_id = $1 AND user_id = $2 AND deleted_at IS NULL`
    : `WHERE user_id = $1 AND deleted_at IS NULL`;

  const params = weekId ? [weekId, userId] : [userId];

  const result = await pool.query(
    `SELECT * FROM tasks ${whereClause} ORDER BY id ASC`,
    params,
  );

  return result.rows;
}

// ----------------------------
// UPDATE TASK
// ----------------------------
async function updateTask(id, userId, data) {
  const checkResult = await pool.query(
    `SELECT w.closed
     FROM tasks t
     JOIN weeks w ON w.id = t.week_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId],
  );

  if (!checkResult.rows.length) throw new Error("Task not found");
  if (checkResult.rows[0].closed) throw new Error("Week closed");

  if (data.status && !allowedStatus.includes(data.status))
    throw new Error("Invalid status");

  if (data.priority && !allowedPriority.includes(data.priority))
    throw new Error("Invalid priority");

  const result = await pool.query(
    `UPDATE tasks SET
       title = COALESCE($1,title),
       description = COALESCE($2,description),
       priority = COALESCE($3,priority),
       status = COALESCE($4,status),
       notify = COALESCE($5,notify),
       due_date = COALESCE($6,due_date)
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.notify,
      data.dueDate,
      id,
      userId,
    ],
  );

  return result.rows[0];
}

// ----------------------------
// SOFT DELETE TASK
// ----------------------------
async function deleteTask(id, userId) {
  const checkResult = await pool.query(
    `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  if (!checkResult.rows.length) throw new Error("Task not found");

  await pool.query(
    `UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return true;
}

// ----------------------------
// MOVE TASK PARA SEMANA ABERTA
// ----------------------------
async function moveTaskToOpenWeek(taskId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const taskRes = await client.query(
      `SELECT * FROM tasks 
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [taskId, userId],
    );

    if (!taskRes.rows.length) throw new Error("Task não encontrada");

    const task = taskRes.rows[0];
    const activeWeek = await ensureActiveWeek(userId);

    await client.query(
      `UPDATE tasks 
       SET week_id = $1, status = 'pending'
       WHERE id = $2 AND user_id = $3`,
      [activeWeek.id, taskId, userId],
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

// ----------------------------
// MOVE TASK PARA SEMANA ESPECÍFICA
// ----------------------------
async function moveTaskToWeek(taskId, weekId, userId) {
  const result = await pool.query(
    `UPDATE tasks
     SET week_id = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [weekId, taskId, userId],
  );

  if (!result.rows.length) throw new Error("Task não encontrada");

  return result.rows[0];
}

// ----------------------------
// CLOSE CURRENT WEEK
// ----------------------------
async function closeCurrentWeek(userId) {
  const week = await ensureActiveWeek(userId);

  await pool.query(
    `UPDATE weeks SET closed = true WHERE id = $1 AND user_id = $2`,
    [week.id, userId],
  );

  return true;
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  moveTaskToOpenWeek,
  moveTaskToWeek,
  closeCurrentWeek,
};
