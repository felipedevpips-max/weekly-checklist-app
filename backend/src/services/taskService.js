let tasks = [];
let idCounter = 1;

function createTask(data) {
  const newTask = {
    id: idCounter++,
    title: data.title,
    priority: data.priority,
    progress: data.progress || 0,
  };

  tasks.push(newTask);
  return newTask;
}

function getTasks() {
  return tasks;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
}

module.exports = {
  createTask,
  getTasks,
  deleteTask,
};
