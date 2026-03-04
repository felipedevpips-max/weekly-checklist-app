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

  // ----------------------------
  // BUSCAR TASKS DE UMA SEMANA
  // ----------------------------
  const fetchTasks = useCallback(async (weekId: number) => {
    try {
      const res = await api.get(`/weeks/${weekId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tasks da semana:", error);
    }
  }, []);

  // ----------------------------
  // BUSCAR SEMANAS FECHADAS
  // ----------------------------
  const fetchWeeks = useCallback(async () => {
    try {
      const res = await api.get("/weeks");
      const closedWeeks = res.data.filter((w: Week) => w.closed);
      setWeeks(closedWeeks);

      if (closedWeeks.length > 0) {
        setSelectedWeek(closedWeeks[0]);
        await fetchTasks(closedWeeks[0].id); // ✅ await para garantir ordem
      }
    } catch (error) {
      console.error("Erro ao buscar semanas:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]); // ✅ agora fetchTasks está listado como dependência

  // ----------------------------
  // RETRY: mover task pendente para semana aberta
  // ----------------------------
  const handleRetry = async (task: Task) => {
    try {
      await api.post(`/weeks/open/tasks`, { taskId: task.id });
      alert(`Task "${task.title}" movida para a semana aberta.`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao tentar novamente:", error);
    }
  };

  // ----------------------------
  // DELETE TASK
  // ----------------------------
  const handleDelete = async (task: Task) => {
    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    }
  };

  // ----------------------------
  // MOVIMENTAR TASKS IN_PROGRESS automaticamente
  // ----------------------------
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    tasks
      .filter((t) => t.status === "in_progress")
      .forEach(async (t) => {
        try {
          await api.post(`/weeks/open/tasks`, { taskId: t.id });
          if (t.notify)
            alert(`Task "${t.title}" em andamento foi movida para a semana aberta!`);
          setTasks((prev) => prev.filter((task) => task.id !== t.id));
        } catch (error) {
          console.error("Erro ao mover task em andamento:", error);
        }
      });
  }, [tasks]);

  // ----------------------------
  // LOAD INICIAL
  // ----------------------------
  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]); // ✅ dependência correta

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
            className={
              selectedWeek?.id === week.id ? styles.activeWeek : styles.weekButton
            }
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
            isWeekClosed={true}
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