import { useState, useMemo } from "react";
import styles from "./home.module.css";
import type { Task } from "../../types/task";

import { Container } from "../../components/Container/Container";
import { CreateTaskForm } from "../../components/CreateTaskForm/CreateTaskForm";
import { ProgressSection } from "../../components/ProgressSection/ProgressSection";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import { EditTaskModal } from "../../components/EditTaskModal/EditTaskModal";
import { TaskList } from "../../components/Tasklist/TaskList";
import { TaskFilter } from "../../components/TaskFilter/TaskFilter";
import { ConfirmCloseWeekModal } from "../../components/ConfirmCloseWeekModal/ConfirmCloseWeekModal";

import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useTaskActions } from "../../hooks/useTaskActions";
import { api } from "../../services/api";

type FilterType = "all" | "pending" | "in_progress" | "done";

export function Home() {
  const { week, tasks, setTasks, loading } = useCurrentWeek();
  const { createTask, updateTask, deleteTask } = useTaskActions({ setTasks });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  // Modal de fechar semana
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  if (loading) return <p>Carregando semana...</p>;

  async function handleCloseWeek() {
    if (!week) return;

    try {
      await api.post(`/tasks/close-week`);
      window.location.reload(); // recarrega para buscar nova semana
    } catch (error) {
      console.error("Erro ao encerrar semana", error);
      alert("Erro ao encerrar semana. Tente novamente.");
    }
  }

  return (
    <Container>
      <h1 className={styles.title}>Checklist Semanal</h1>

      {/* Botão Encerrar Semana */}
      {week && !week.closed && (
        <button
          className={styles.closeWeekButton}
          onClick={() => setIsCloseModalOpen(true)}
        >
          Encerrar Semana
        </button>
      )}

      {/* Informações da semana */}
      {week && (
        <p className={styles.weekInfo}>
          Semana atual: {new Date(week.start_date).toLocaleDateString()} -{" "}
          {new Date(week.end_date).toLocaleDateString()}
        </p>
      )}

      {/* Criar Task */}
      <CreateTaskForm onCreate={createTask} />

      {/* Progresso */}
      <ProgressSection tasks={tasks} />

      {/* Filtro */}
      <TaskFilter activeFilter={filter} onChange={setFilter} />

      {/* Lista de Tasks */}
      <TaskList
        tasks={filteredTasks}
        isWeekClosed={week?.closed} // bloqueio visual se semana fechada
        onUpdate={updateTask}
        onEdit={setEditingTask}
        onDelete={setTaskToDelete}
      />

      {/* Modal Edit */}
      {editingTask && (
        <EditTaskModal
          isOpen
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            updateTask(updatedTask);
            setEditingTask(null);
          }}
        />
      )}

      {/* Modal Delete */}
      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen
          taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => {
            await deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }}
        />
      )}

      {/* Modal de Encerrar Semana */}
      {isCloseModalOpen && (
        <ConfirmCloseWeekModal
          isOpen
          onClose={() => setIsCloseModalOpen(false)}
          onConfirm={() => {
            handleCloseWeek();
            setIsCloseModalOpen(false);
          }}
        />
      )}
    </Container>
  );
}