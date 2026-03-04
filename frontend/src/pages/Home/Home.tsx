import { useState, useEffect } from "react";
import styles from "./home.module.css";
import type { Task } from "../../types/task";
import { CreateTaskForm } from "../../components/CreateTaskForm/CreateTaskForm";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { Container } from "../../components/Container/Container";
import { useTasks } from "../../hooks/useTasks";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import { EditTaskModal } from "../../components/EditTaskModal/EditTaskModal";
import { api } from "../../services/api";
import { ProgressSection } from "../../components/ProgressSection/ProgressSection";

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
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  };

  // ✅ DELETE REAL + SINCRONIZAÇÃO TOTAL
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);

      // refetch completo para garantir que backend e frontend estejam iguais
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
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

      <ProgressSection tasks={tasks} />

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
          onEdit={() => setEditingTask(task)}
          onDelete={() => setTaskToDelete(task)}
        />
      ))}

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            handleUpdate(updatedTask);
            setEditingTask(null);
          }}
        />
      )}

      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen={!!taskToDelete}
          taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => {
            await handleDelete(taskToDelete.id);
            setTaskToDelete(null);
          }}
        />
      )}
    </Container>
  );
}
