const { pool } = require("../database/connection");

// =============================
// VALORES PERMITIDOS
// =============================
const allowedStatus = ["pending", "in_progress", "done"];
const allowedPriority = ["low", "medium", "high"];

// =============================
// PEGAR SEMANA ATUAL
// =============================
async function getCurrentWeek() {
  const today = new Date();
  const day = today.getDay();

  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const result = await pool.query(
    "SELECT * FROM weeks WHERE start_date = $1 AND end_date = $2",
    [sunday.toISOString().split("T")[0], saturday.toISOString().split("T")[0]],
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  const newWeek = await pool.query(
    "INSERT INTO weeks (start_date, end_date, closed) VALUES ($1, $2, false) RETURNING *",
    [sunday.toISOString().split("T")[0], saturday.toISOString().split("T")[0]],
  );

  return newWeek.rows[0];
}

// =============================
// CRIAR TASK
// =============================
async function createTask(data) {
  const week = await getCurrentWeek();

  const status = data.status || "pending";
  const priority = data.priority || "low";

  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status value");
  }

  if (!allowedPriority.includes(priority)) {
    throw new Error("Invalid priority value");
  }

  const result = await pool.query(
    `INSERT INTO tasks 
     (title, description, priority, status, due_date, week_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.title,
      data.description || "",
      priority,
      status,
      data.dueDate || week.end_date,
      week.id,
    ],
  );

  return result.rows[0];
}

// =============================
// LISTAR TASKS
// =============================
async function getTasks(weekId = null) {
  if (weekId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE week_id = $1 ORDER BY id ASC",
      [weekId],
    );
    return result.rows;
  }

  const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
  return result.rows;
}

// =============================
// ATUALIZAR TASK
// =============================
async function updateTask(id, data) {
  if (data.status && !allowedStatus.includes(data.status)) {
    throw new Error("Invalid status value");
  }

  if (data.priority && !allowedPriority.includes(data.priority)) {
    throw new Error("Invalid priority value");
  }

  const result = await pool.query(
    `UPDATE tasks SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      priority = COALESCE($3, priority),
      status = COALESCE($4, status),
      due_date = COALESCE($5, due_date)
     WHERE id = $6
     RETURNING *`,
    [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.dueDate,
      id,
    ],
  );

  return result.rows[0];
}

// =============================
// DELETAR TASK
// =============================
async function deleteTask(id) {
  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return true;
}

// =============================
// FECHAR SEMANA
// =============================
async function closeCurrentWeek() {
  const week = await getCurrentWeek();

  await pool.query("UPDATE weeks SET closed = true WHERE id = $1", [week.id]);

  return true;
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  closeCurrentWeek,
  getCurrentWeek,
};
