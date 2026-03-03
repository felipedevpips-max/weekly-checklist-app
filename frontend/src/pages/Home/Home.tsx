import { useState, useEffect } from "react";

import styles from "./home.module.css";
import type { Task } from "../../types/task";
import { CreateTaskForm } from "../../components/CreateTaskForm/CreateTaskForm";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { EditTaskModal } from "../../components/EditTaskModal/EditTaskModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import { Container } from "../../components/Container/Container";
import { useTasks } from "../../hooks/useTasks";

export function Home() {
  const { tasks: initialTasks, loading, error } = useTasks();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleUpdate = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
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
    <Container>
      <h1 className={styles.title}>Checklist Semanal</h1>

      <CreateTaskForm onCreate={handleCreate} />

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
          onEdit={() => setEditingTask(task)}
          onDelete={() => setTaskToDelete(task)}
        />
      ))}

      {/* Modal de edição centralizado */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            handleUpdate(updatedTask);
            setEditingTask(null);
          }}
        />
      )}

      {/* Modal de confirmação centralizado */}
      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen={!!taskToDelete}
          taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => {
            handleDelete(taskToDelete.id);
            setTaskToDelete(null);
          }}
        />
      )}
    </Container>
  );
}