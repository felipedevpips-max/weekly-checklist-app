import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import styles from "./history.module.css";
import { DeleteHistoryModal } from "../../components/DeleteHistoryModal/DeleteHistoryModal";
import { MoveHistoryModal } from "../../components/MoveHistoryModal/MoveHistoryModal";

// =============================
// 📦 Agrupar semanas por mês
// =============================
function groupWeeksByMonth(weeks: Week[]) {
  const groups: Record<string, Week[]> = {};

  weeks.forEach((week) => {
    const date = new Date(week.start_date);

    const month = date.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(week);
  });

  return groups;
}

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal mover tasks
  const [modalMoveVisible, setModalMoveVisible] = useState(false);
  const [modalMoveTasks, setModalMoveTasks] = useState<Task[]>([]);

  // Modal deletar task
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // =============================
  // 📊 Agrupamento de semanas
  // =============================
  const weeksByMonth = groupWeeksByMonth(weeks);

  // =============================
  // 📥 Buscar tasks da semana
  // =============================
  const fetchTasks = useCallback(async (weekId: number) => {
    try {
      const res = await api.get(`/weeks/${weekId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Erro ao buscar tasks da semana:", error);
    }
  }, []);

  // =============================
  // 📥 Buscar semanas fechadas
  // =============================
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

  // =============================
  // 🔁 Mover task manualmente
  // =============================
  const handleRetry = async (task: Task) => {
    try {
      await api.post(`/weeks/open/tasks`, { taskId: task.id });

      setTasks((prev) => prev.filter((t) => t.id !== task.id));

      setModalMoveTasks([task]);
      setModalMoveVisible(true);
    } catch (error) {
      console.error("Erro ao mover task:", error);
    }
  };

  // =============================
  // 🗑 Deletar task
  // =============================
  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setModalDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await api.delete(`/tasks/${taskToDelete.id}`);

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    } finally {
      setTaskToDelete(null);
      setModalDeleteVisible(false);
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
    setModalDeleteVisible(false);
  };

  // =============================
  // 🛡 Filtro defensivo
  // =============================
  const visibleTasks = tasks.filter((task) => task.status !== "in_progress");

  if (loading) return <p>Carregando histórico...</p>;
  if (weeks.length === 0) return <p>Nenhuma semana fechada encontrada.</p>;

  return (
    <Container>
      <h1 className={styles.title}>Histórico de Semanas</h1>

      {/* =============================
          MESES
      ============================= */}

      <div className={styles.monthsWrapper}>
        {Object.entries(weeksByMonth).map(([month, monthWeeks]) => (
          <div key={month} className={styles.monthSection}>
            <h3 className={styles.monthTitle}>{month}</h3>

            <div className={styles.weeksRow}>
              {monthWeeks.map((week, index) => (
                <button
                  key={week.id}
                  className={
                    selectedWeek?.id === week.id
                      ? styles.activeWeek
                      : styles.weekButton
                  }
                  onClick={() => {
                    setSelectedWeek(week);
                    fetchTasks(week.id);
                  }}
                >
                  Semana {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* =============================
          TASKS
      ============================= */}

      <div className={styles.tasksSection}>
        {visibleTasks.length === 0 && (
          <p>Nenhuma task encontrada nesta semana.</p>
        )}

        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isWeekClosed={true}
            onRetry={
              task.status === "pending" ? () => handleRetry(task) : undefined
            }
            onDelete={() => handleDeleteClick(task)}
          />
        ))}
      </div>

      {/* Modal mover tasks */}
      <MoveHistoryModal
        visible={modalMoveVisible}
        tasks={modalMoveTasks}
        onClose={() => setModalMoveVisible(false)}
      />

      {/* Modal deletar task */}
      <DeleteHistoryModal
        visible={modalDeleteVisible}
        task={taskToDelete ?? undefined}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Container>
  );
}
