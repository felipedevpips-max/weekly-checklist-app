import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import styles from "./history.module.css";

// ----------------------------
// Modal de notificações
// ----------------------------
function NotificationModal({
  tasks,
  onClose,
}: {
  tasks: Task[];
  onClose: () => void;
}) {
  if (!tasks.length) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Tarefas movidas para a semana aberta</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title} {task.notify && "(Notificação ativa)"}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={styles.modalButton}>
          OK
        </button>
      </div>
    </div>
  );
}

// ----------------------------
// Componente History
// ----------------------------
export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalTasks, setModalTasks] = useState<Task[]>([]); // tasks a mostrar na modal

  // ----------------------------
  // FETCH TASKS
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
  // FETCH SEMANAS
  // ----------------------------
  const fetchWeeks = useCallback(async () => {
    try {
      const res = await api.get("/weeks");
      const closedWeeks = res.data.filter((w: Week) => w.closed);
      setWeeks(closedWeeks);

      if (closedWeeks.length > 0) {
        setSelectedWeek(closedWeeks[0]);
        await fetchTasks(closedWeeks[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar semanas:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]); // ✅ incluir fetchTasks como dependência

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  // ----------------------------
  // MOVER TASK PARA SEMANA ABERTA
  // ----------------------------
  const moveTaskToOpenWeek = async (task: Task) => {
    try {
      await api.post(`/weeks/open/tasks`, { taskId: task.id });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setModalTasks((prev) => [...prev, task]);

      if (task.notify) {
        await api.post("/notifications/send", {
          taskId: task.id,
          message: `A task "${task.title}" foi movida para a semana aberta!`,
        });
      }
    } catch (error) {
      console.error("Erro ao mover task:", error);
    }
  };

  // ----------------------------
  // DELETE
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
  // RETRY MANUAL (quando pendente)
  // ----------------------------
  const handleRetry = async (task: Task) => {
    await moveTaskToOpenWeek(task);
  };

  // ----------------------------
  // MOVENDO AUTOMATICAMENTE TASKS IN_PROGRESS
  // ----------------------------
  useEffect(() => {
    if (!tasks.length) return;

    tasks
      .filter((t) => t.status === "in_progress")
      .forEach(async (t) => {
        await moveTaskToOpenWeek(t);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); // não precisa dependência de fetchTasks aqui

  if (loading) return <p>Carregando histórico...</p>;
  if (!weeks.length) return <p>Nenhuma semana fechada encontrada.</p>;

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

      {/* Tasks */}
      <div className={styles.tasksSection}>
        {tasks.length === 0 && <p>Nenhuma task encontrada nesta semana.</p>}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isWeekClosed={true}
            onDelete={() => handleDelete(task)}
            onEdit={task.status === "pending" ? () => handleRetry(task) : undefined}
          />
        ))}
      </div>

      {/* Modal */}
      <NotificationModal tasks={modalTasks} onClose={() => setModalTasks([])} />
    </Container>
  );
}