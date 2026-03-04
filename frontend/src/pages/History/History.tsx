import { useState, useEffect } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import styles from "./history.module.css";

// Modal simples
function Modal({ visible, tasks, onClose }: { visible: boolean; tasks: Task[]; onClose: () => void }) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Tasks movidas para a semana aberta</h2>
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              <strong>{t.title}</strong> - {t.status === "in_progress" ? "Em andamento" : "Pendente"}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={styles.okButton}>
          OK
        </button>
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
  const [movedTasks, setMovedTasks] = useState<Task[]>([]);

  // Busca semanas e tasks
  useEffect(() => {
    async function fetchData() {
      try {
        const resWeeks = await api.get("/weeks");
        const closedWeeks = resWeeks.data.filter((w: Week) => w.closed);
        setWeeks(closedWeeks);

        if (closedWeeks.length > 0) {
          const week = closedWeeks[0];
          setSelectedWeek(week);
          const resTasks = await api.get(`/weeks/${week.id}/tasks`);
          setTasks(resTasks.data);
        }
      } catch (error) {
        console.error("Erro ao buscar semanas e tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // ✅ Sem dependências externas, nenhum warning

  // Mover automaticamente tasks em andamento para semana aberta
  useEffect(() => {
    const tasksToMove = tasks.filter((t) => t.status === "in_progress");
    if (tasksToMove.length === 0) return;

    async function moveTasks() {
      const moved: Task[] = [];

      for (const t of tasksToMove) {
        try {
          await api.post("/weeks/open/tasks", { taskId: t.id });
          moved.push(t);

          // Notificação backend
          await api.post("/notifications/send", { taskId: t.id });
        } catch (error) {
          console.error("Erro ao mover task em andamento:", error);
        }
      }

      if (moved.length > 0) {
        setMovedTasks(moved);
        setModalVisible(true);
        setTasks((prev) => prev.filter((task) => !moved.find((m) => m.id === task.id)));
      }
    }

    moveTasks();
  }, [tasks]);

  const handleRetry = async (task: Task) => {
    try {
      await api.post("/weeks/open/tasks", { taskId: task.id });
      await api.post("/notifications/send", { taskId: task.id });
      alert(`Task "${task.title}" movida para a semana aberta.`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Erro ao tentar novamente:", error);
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

      {/* Seleção de semanas */}
      <div className={styles.weeksWrapper}>
        {weeks.map((week) => (
          <button
            key={week.id}
            className={selectedWeek?.id === week.id ? styles.activeWeek : styles.weekButton}
            onClick={async () => {
              setSelectedWeek(week);
              const resTasks = await api.get(`/weeks/${week.id}/tasks`);
              setTasks(resTasks.data);
            }}
          >
            {new Date(week.start_date).toLocaleDateString()} - {new Date(week.end_date).toLocaleDateString()}
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
            onEdit={task.status === "pending" ? () => handleRetry(task) : undefined}
          />
        ))}
      </div>

      {/* Modal */}
      <Modal visible={modalVisible} tasks={movedTasks} onClose={() => setModalVisible(false)} />
    </Container>
  );
}