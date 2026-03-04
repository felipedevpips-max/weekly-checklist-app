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
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📅 Buscar todas as semanas (histórico)
  useEffect(() => {
    async function fetchWeeks() {
      setLoadingWeeks(true);
      setError(null);

      try {
        const res = await api.get("/weeks");
        // filtrar apenas semanas fechadas
        const closedWeeks = res.data.filter((w: Week) => w.closed);
        setWeeks(closedWeeks);
      } catch (err) {
        console.error("Erro ao buscar semanas:", err);
        setError("Não foi possível carregar o histórico de semanas.");
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
    setError(null);

    try {
      const res = await api.get(`/weeks/${week.id}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error("Erro ao buscar tasks:", err);
      setTasks([]);
      setError("Não foi possível carregar as tarefas desta semana.");
    } finally {
      setLoadingTasks(false);
    }
  }

  return (
    <Container>
      <h1>Histórico de Semanas</h1>

      {/* Erro geral */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Lista de semanas */}
      <div className={styles.weeksWrapper}>
        {loadingWeeks ? (
          <p>Carregando semanas...</p>
        ) : weeks.length === 0 ? (
          <p>Nenhuma semana fechada encontrada.</p>
        ) : (
          weeks.map((w) => (
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
          ))
        )}
      </div>

      {/* Lista de tarefas da semana selecionada */}
      {selectedWeek && (
        <div className={styles.tasksSection}>
          <h2>
            Semana de {new Date(selectedWeek.start_date).toLocaleDateString()} a{" "}
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
