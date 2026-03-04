import { useState, useEffect } from "react";
import type { Task } from "../../types/task";
import type { Week } from "../../types/week";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import styles from "./history.module.css";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // 🔹 Buscar semanas fechadas
  useEffect(() => {
    async function fetchWeeks() {
      try {
        const res = await api.get("/weeks"); // rota: getAllWeeks
        const closedWeeks = res.data.filter((w: Week) => w.closed);
        setWeeks(closedWeeks);
      } catch (error) {
        console.error("Erro ao buscar semanas:", error);
      }
    }
    fetchWeeks();
  }, []);

  // 🔹 Buscar tarefas de uma semana
  async function loadTasks(week: Week) {
    setLoadingTasks(true);
    setSelectedWeek(week);

    try {
      const res = await api.get(`/weeks/${week.id}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  // 🔹 Deletar tarefa
  async function handleDeleteTask(taskId: number) {
    if (!window.confirm("Tem certeza que deseja deletar esta tarefa?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setTaskToDelete(null);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      alert("Erro ao deletar tarefa");
    }
  }

  // 🔹 Tentar novamente → mover para semana atual aberta
  async function handleRetryTask(taskId: number) {
    try {
      await api.post(`/tasks/${taskId}/retry`); // backend deve mover para semana atual
      alert("Tarefa movida para a semana atual!");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
      alert("Erro ao tentar novamente");
    }
  }

  return (
    <Container>
      <h1>Histórico de Semanas</h1>

      {/* 🔹 Lista de semanas */}
      <div className={styles.weeksWrapper}>
        {weeks.map((w) => (
          <button
            key={w.id}
            onClick={() => loadTasks(w)}
            className={selectedWeek?.id === w.id ? styles.activeWeek : styles.weekButton}
          >
            {new Date(w.start_date).toLocaleDateString()} -{" "}
            {new Date(w.end_date).toLocaleDateString()}
          </button>
        ))}
      </div>

      {/* 🔹 Tarefas da semana selecionada */}
      {selectedWeek && (
        <div className={styles.tasksSection}>
          <h2>
            Semana de {new Date(selectedWeek.start_date).toLocaleDateString()}
          </h2>

          {loadingTasks ? (
            <p>Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p>Nenhuma tarefa nesta semana.</p>
          ) : (
            tasks.map((task) => {
              // Somente exibe cards de tarefas que devem aparecer no histórico
              if (task.status === "in_progress") {
                // 💡 Lógica: tarefas em andamento já foram movidas → não exibe aqui
                return null;
              }

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  isWeekClosed
                  onDelete={() => handleDeleteTask(task.id)}
                  onEdit={task.status === "pending" ? () => handleRetryTask(task.id) : undefined}
                />
              );
            })
          )}
        </div>
      )}

      {/* 🔹 Modal de confirmação de exclusão */}
      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen
          taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => handleDeleteTask(taskToDelete.id)}
        />
      )}
    </Container>
  );
}