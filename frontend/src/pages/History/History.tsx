import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { Container } from "../../components/Container/Container";
import styles from "./history.module.css";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // 📅 Buscar todas as semanas e filtrar apenas as fechadas
  useEffect(() => {
    async function fetchWeeks() {
      try {
        const res = await api.get("/weeks");
        const closedWeeks = res.data.filter((w: Week) => w.closed);
        setWeeks(closedWeeks);
      } catch (error) {
        console.error("Erro ao buscar semanas:", error);
      } finally {
        setLoadingWeeks(false);
      }
    }

    fetchWeeks();
  }, []);

  // 📋 Buscar tasks de uma semana específica
  async function loadTasks(week: Week) {
    setLoadingTasks(true);
    setSelectedWeek(week);
    setTasks([]);

    try {
      const res = await api.get(`/weeks/${week.id}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao carregar tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  if (loadingWeeks) return <p>Carregando histórico...</p>;

  return (
    <Container>
      <h1>Histórico</h1>

      {/* 📅 Lista de semanas */}
      {weeks.length === 0 ? (
        <p>Nenhuma semana fechada encontrada.</p>
      ) : (
        <div className={styles.weeksWrapper}>
          {weeks.map((w) => (
            <button
              key={w.id}
              onClick={() => loadTasks(w)}
              className={
                selectedWeek?.id === w.id
                  ? styles.activeWeek
                  : styles.weekButton
              }
            >
              {new Date(w.start_date).toLocaleDateString()} -{" "}
              {new Date(w.end_date).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {/* 📋 Lista de tarefas da semana selecionada */}
      {selectedWeek && (
        <div className={styles.tasksSection}>
          <h2>
            Semana de{" "}
            {new Date(selectedWeek.start_date).toLocaleDateString()} a{" "}
            {new Date(selectedWeek.end_date).toLocaleDateString()}
          </h2>

          {loadingTasks ? (
            <p>Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p>Nenhuma tarefa nesta semana.</p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </Container>
  );
}