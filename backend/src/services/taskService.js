let tasks = [];
let weeks = [];
let taskIdCounter = 1;
let weekIdCounter = 1;

// Semana atual
function getCurrentWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = domingo
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  let currentWeek = weeks.find(
    (w) => w.start.getTime() === sunday.getTime() && w.end.getTime() === saturday.getTime()
  );

  if (!currentWeek) {
    currentWeek = {
      id: weekIdCounter++,
      start: sunday,
      end: saturday,
      closed: false,
    };
    weeks.push(currentWeek);
  }

  return currentWeek;
}

// Map status / priority para frontend
const statusMap = { pendente: "pending", "em andamento": "in_progress", concluída: "done" };
const priorityMap = { baixa: "low", média: "medium", alta: "high" };

// CRUD Tasks
function createTask(data) {
  const week = getCurrentWeek();
  const newTask = {
    id: taskIdCounter++,
    title: data.title,
    description: data.description || "",
    priority: priorityMap[data.priority] || "low",
    status: statusMap[data.status] || "pending",
    progress: data.progress ?? 0,
    notify: data.notify ?? false,
    weekId: week.id,
    createdAt: new Date(),
    dueDate: data.dueDate || week.end.toISOString(),
  };
  tasks.push(newTask);
  return newTask;
}

function getTasks(weekId = null) {
  return weekId ? tasks.filter((t) => t.weekId === weekId) : tasks;
}

function updateTask(id, data) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.priority !== undefined) task.priority = priorityMap[data.priority] || data.priority;
  if (data.status !== undefined) task.status = statusMap[data.status] || data.status;
  if (data.progress !== undefined) task.progress = data.progress;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.notify !== undefined) task.notify = data.notify;

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

// Fechar semana
function closeCurrentWeek() {
  const week = getCurrentWeek();
  if (week.closed) return false;

  week.closed = true;

  const nextWeekStart = new Date(week.end.getTime() + 1);
  const nextWeekEnd = new Date(week.end.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeek = { id: weekIdCounter++, start: nextWeekStart, end: nextWeekEnd, closed: false };
  weeks.push(nextWeek);

  tasks.forEach((t) => {
    if (t.weekId === week.id && t.status !== "done") {
      t.weekId = nextWeek.id;
      t.dueDate = nextWeek.end.toISOString();
    }
  });

  return true;
}

module.exports = { createTask, getTasks, updateTask, deleteTask, closeCurrentWeek, getCurrentWeek, weeks };