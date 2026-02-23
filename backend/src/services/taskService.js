let tasks = [];
let weeks = [];
let taskIdCounter = 1;
let weekIdCounter = 1;

// --- Semana atual ---
function getCurrentWeek() {
  const today = new Date();
  // Domingo = início, sábado = fim
  const day = today.getDay(); // 0 = domingo
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);
  sunday.setHours(0,0,0,0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23,59,59,999);

  // Verifica se já existe semana
  let currentWeek = weeks.find(w => w.start.getTime() === sunday.getTime() && w.end.getTime() === saturday.getTime());
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

// --- CRUD Tasks ---
function createTask(data) {
  const week = getCurrentWeek();
  const newTask = {
    id: taskIdCounter++,
    title: data.title,
    priority: data.priority || "baixa",
    status: data.status || "pendente",
    progress: data.progress || 0,
    weekId: week.id,
    createdAt: new Date(),
    dueDate: data.dueDate || null,
  };
  tasks.push(newTask);
  return newTask;
}

function getTasks(weekId = null) {
  if (weekId) {
    return tasks.filter(t => t.weekId === weekId);
  }
  return tasks;
}

function updateTask(id, data) {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;

  if (data.title !== undefined) task.title = data.title;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.progress !== undefined) task.progress = data.progress;

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
}

// --- Histórico / fechar semana ---
function closeCurrentWeek() {
  const week = getCurrentWeek();
  if (week.closed) return false;

  // Marca semana como fechada
  week.closed = true;

  // Move tarefas pendentes para próxima semana
  const nextWeek = {
    id: weekIdCounter++,
    start: new Date(week.end.getTime() + 1),
    end: new Date(week.end.getTime() + 7*24*60*60*1000),
    closed: false,
  };
  weeks.push(nextWeek);

  tasks.forEach(t => {
    if (t.weekId === week.id && t.status !== "concluída") {
      t.weekId = nextWeek.id;
    }
  });

  return true;
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  closeCurrentWeek,
  getCurrentWeek,
  weeks,
};