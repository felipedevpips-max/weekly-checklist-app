import styles from "./App.module.css";
import { useTasks } from "./hooks/useTasks";
import { useState, useEffect } from "react";
import type { Task } from "./types/task";
import { CreateTaskForm } from "./components/CreateTaskForm/CreateTaskForm";
import { TaskCard } from "./components/TaskCard";

function App() {
  const { tasks: initialTasks, loading, error } = useTasks();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleUpdate = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  };

  const handleDelete = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreate = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Weekly Checklist</h1>

      <CreateTaskForm onCreate={handleCreate} />

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default App;
