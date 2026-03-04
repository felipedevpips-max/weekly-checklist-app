import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import styles from "./history.module.css";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar semanas fechadas
  const fetchWeeks = useCallback(async () => {
    try {
      const res = await api.get("/weeks"); // todas as semanas
      const closedWeeks = res.data.filter((w: Week) => w.closed);
      setWeeks(closedWeeks);

      if (closedWeeks.length > 0) {
        setSelectedWeek(closedWeeks[0]);
        fetchTasks(closedWeeks[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar semanas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar tasks de uma semana
  const fetchTasks = useCallback(async (weekId: number) => {
    try {
      const res = await api.get(`/weeks/${weekId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tasks da semana:", error);
    }
  }, []);

  // Retry: move task pendente para semana aberta
  const handleRetry = async (task: Task) => {
    try {
      await api.post("/weeks/open/tasks", { taskId: task.id });
      alert(`Task "${task.title}" movida para a semana aberta.`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao tentar novamente:", error);
    }
  };

  // Deletar task
  const handleDelete = async (task: Task) => {
    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    }
  };

  // Mover automaticamente tasks em andamento para semana aberta
  useEffect(() => {
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");

    if (inProgressTasks.length === 0) return;

    inProgressTasks.forEach(async (task) => {
      try {
        await api.post("/weeks/open/tasks", { taskId: task.id });
        if (task.notify) {
          alert(`Task "${task.title}" em andamento foi movida para a semana aberta!`);
        }
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      } catch (error) {
        console.error("Erro ao mover task em andamento:", error);
      }
    });
  }, [tasks]);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  if (loading) return <p>Carregando histórico...</p>;
  if (weeks.length === 0) return <p>Nenhuma semana fechada encontrada.</p>;

  return (
    <Container>
      <h1 className={styles.title}>Histórico de Semanas</h1>

      {/* Seleção de semanas */}
      <div className={styles.weeksWrapper}>
        {weeks.map((week) => (
          <button
            key={week.id}
            className={selectedWeek?.id === week.id ? styles.activeWeek : styles.weekButton}
            onClick={() => {
              setSelectedWeek(week);
              fetchTasks(week.id);
            }}
          >
            {new Date(week.start_date).toLocaleDateString()} -{" "}
            {new Date(week.end_date).toLocaleDateString()}
          </button>
        ))}
      </div>

      {/* Tasks da semana */}
      <div className={styles.tasksSection}>
        {tasks.length === 0 && <p>Nenhuma task encontrada nesta semana.</p>}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isWeekClosed={true} // histórico = semana fechada
            onDelete={() => handleDelete(task)}
            onEdit={
              task.status === "pending" ? () => handleRetry(task) : undefined
            }
          />
        ))}
      </div>
    </Container>
  );
}