const pool = require("../config/db");
const { ensureActiveWeek } = require("./weekService");

// =============================
// VALORES PERMITIDOS
// =============================
const allowedStatus = ["pending", "in_progress", "done"];
const allowedPriority = ["low", "medium", "high"];

// =============================
// CRIAR TASK
// =============================
async function createTask(data) {
  // ✅ Garante que existe semana ativa
  const week = await ensureActiveWeek();

  const status = data.status || "pending";
  const priority = data.priority || "low";

  if (!allowedStatus.includes(status)) throw new Error("Invalid status value");
  if (!allowedPriority.includes(priority))
    throw new Error("Invalid priority value");

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
  const query = weekId
    ? ["SELECT * FROM tasks WHERE week_id = $1 ORDER BY id ASC", [weekId]]
    : ["SELECT * FROM tasks ORDER BY id ASC", []];

  const result = await pool.query(...query);
  return result.rows;
}

// =============================
// ATUALIZAR TASK (PROTEGIDO)
// =============================
async function updateTask(id, data) {
  // ✅ Verifica se a tarefa existe e se a semana está fechada
  const checkResult = await pool.query(
    `SELECT w.closed
     FROM tasks t
     JOIN weeks w ON t.week_id = w.id
     WHERE t.id = $1`,
    [id],
  );

  if (checkResult.rows.length === 0) throw new Error("Tarefa não encontrada");

  if (checkResult.rows[0].closed) {
    throw new Error("Não é possível editar tarefa de semana encerrada");
  }

  if (data.status && !allowedStatus.includes(data.status))
    throw new Error("Invalid status value");
  if (data.priority && !allowedPriority.includes(data.priority))
    throw new Error("Invalid priority value");

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
// DELETAR TASK (PROTEGIDO)
// =============================
async function deleteTask(id) {
  const checkResult = await pool.query(
    `SELECT w.closed
     FROM tasks t
     JOIN weeks w ON t.week_id = w.id
     WHERE t.id = $1`,
    [id],
  );

  if (checkResult.rows.length === 0) throw new Error("Tarefa não encontrada");

  if (checkResult.rows[0].closed) {
    throw new Error("Não é possível deletar tarefa de semana encerrada");
  }

  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return true;
}

// =============================
// FECHAR SEMANA
// =============================
async function closeCurrentWeek() {
  const week = await ensureActiveWeek();
  await pool.query("UPDATE weeks SET closed = true WHERE id = $1", [week.id]);
  return true;
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  closeCurrentWeek,
};
