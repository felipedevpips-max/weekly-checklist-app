import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import styles from "./history.module.css";

// Modal simples de confirmação
function Modal({ visible, onClose, tasks }: { visible: boolean; onClose: () => void; tasks: Task[] }) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Tarefas movidas para a semana aberta</h2>
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
        <button onClick={onClose} className={styles.modalButton}>OK</button>
      </div>
    </div>
  );
}

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async (weekId: number) => {
    try {
      const res = await api.get(`/weeks/${weekId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tasks da semana:", error);
    }
  }, []);

  const fetchWeeks = useCallback(async () => {
    try {
      const res = await api.get("/weeks");
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
  }, [fetchTasks]);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const handleRetry = async (task: Task) => {
    try {
      await api.post(`/weeks/open/tasks`, { taskId: task.id });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setModalTasks([task]);
      setModalVisible(true);
    } catch (error) {
      console.error("Erro ao mover task para semana aberta:", error);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    }
  };

  if (loading) return <p>Carregando histórico...</p>;
  if (weeks.length === 0) return <p>Nenhuma semana fechada encontrada.</p>;

  return (
    <Container>
      <h1 className={styles.title}>Histórico de Semanas</h1>

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
            {new Date(week.start_date).toLocaleDateString()} - {new Date(week.end_date).toLocaleDateString()}
          </button>
        ))}
      </div>

      <div className={styles.tasksSection}>
        {tasks.length === 0 && <p>Nenhuma task encontrada nesta semana.</p>}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isWeekClosed={true}
            onDelete={() => handleDelete(task)}
            onRetry={task.status === "pending" ? () => handleRetry(task) : undefined}
          />
        ))}
      </div>

      <Modal
        visible={modalVisible}
        tasks={modalTasks}
        onClose={() => setModalVisible(false)}
      />
    </Container>
  );
}