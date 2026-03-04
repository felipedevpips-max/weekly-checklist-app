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

import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useTaskActions } from "../../hooks/useTaskActions";
import { api } from "../../services/api";

type FilterType = "all" | "pending" | "in_progress" | "done";

export function Home() {
  /* 🔥 Busca semana ativa do backend */
  const { week, tasks, setTasks, loading } = useCurrentWeek();

  /* 🔥 Hook responsável apenas por manipular estado */
  const { createTask, updateTask, deleteTask } = useTaskActions({
    setTasks,
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  /* 🎯 Filtro profissional */
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  if (loading) return <p>Carregando semana...</p>;

  // -----------------------------
  // 🔒 Função Encerrar Semana (usando endpoint correto)
  // -----------------------------
  async function handleCloseWeek() {
    if (!week) return;

    const confirmClose = window.confirm(
      "Tem certeza que deseja encerrar esta semana?",
    );
    if (!confirmClose) return;

    try {
      // ⚡ usa endpoint do taskController que fecha a semana atual
      await api.post("/tasks/close-week");

      // 🔁 recarrega a página para pegar nova semana e tasks
      window.location.reload();
    } catch (error) {
      console.error("Erro ao encerrar semana", error);
      alert("Erro ao encerrar semana. Tente novamente.");
    }
  }

  return (
    <Container>
      <h1 className={styles.title}>Checklist Semanal</h1>

      {/* -----------------------------
          Botão Encerrar Semana
      ----------------------------- */}
      {week && !week.closed && (
        <button className={styles.closeWeekButton} onClick={handleCloseWeek}>
          Encerrar Semana
        </button>
      )}

      {/* 📅 Informações da semana ativa */}
      {week && (
        <p className={styles.weekInfo}>
          Semana atual: {new Date(week.start_date).toLocaleDateString()} -{" "}
          {new Date(week.end_date).toLocaleDateString()}
        </p>
      )}

      {/* 🆕 Criar Task */}
      <CreateTaskForm onCreate={createTask} />

      {/* 📊 Progresso */}
      <ProgressSection tasks={tasks} />

      {/* 🔎 Filtro */}
      <TaskFilter activeFilter={filter} onChange={setFilter} />

      {/* 📋 Lista */}
      <TaskList
        tasks={filteredTasks}
        isWeekClosed={week?.closed} // bloqueio visual
        onUpdate={updateTask}
        onEdit={setEditingTask}
        onDelete={setTaskToDelete}
      />

      {/* ✏️ Modal Edit */}
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

      {/* 🗑️ Modal Delete */}
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
    </Container>
  );
}