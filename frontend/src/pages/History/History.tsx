import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";

import { DeleteHistoryModal } from "../../components/DeleteHistoryModal/DeleteHistoryModal";
import { UndoToast } from "../../components/UndoToast/UndoToast";

import styles from "./history.module.css";
import { MonthList } from "../../components/MonthList/MonthList";
import { TasksGrid } from "../../components/TasksGrid/TasksGrid";
import { groupWeeksByMonth } from "../../utils/groupWeeksByMonth";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [lastMovedTask, setLastMovedTask] = useState<Task | null>(null);

  const weeksByMonth = groupWeeksByMonth(weeks);

  const handleDeselectWeek = () => {
    setSelectedWeek(null);
    setTasks([]);
  };

  const fetchTasks = useCallback(async (weekId: number) => {
    const res = await api.get(`/weeks/${weekId}/tasks`);
    setTasks(res.data);
  }, []);

  const fetchWeeks = useCallback(async () => {
    try {
      const res = await api.get("/weeks");

      const closedWeeks = res.data.filter((w: Week) => w.closed);

      setWeeks(closedWeeks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const handleRetry = async (task: Task) => {
    await api.post(`/weeks/open/tasks`, { taskId: task.id });

    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    setLastMovedTask(task);
    setUndoToastVisible(true);
  };

  const handleUndoMove = async () => {
    if (!lastMovedTask || !selectedWeek) return;

    await api.post(`/weeks/${selectedWeek.id}/tasks`, {
      taskId: lastMovedTask.id,
    });

    setTasks((prev) => [...prev, lastMovedTask]);

    setUndoToastVisible(false);
    setLastMovedTask(null);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setModalDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    await api.delete(`/tasks/${taskToDelete.id}`);

    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));

    setTaskToDelete(null);
    setModalDeleteVisible(false);
  };

  const visibleTasks = tasks.filter((task) => task.status !== "in_progress");

  useEffect(() => {
    if (!undoToastVisible) return;

    const timer = setTimeout(() => {
      setUndoToastVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [undoToastVisible]);

  if (loading) return <p>Carregando histórico...</p>;

  return (
    <Container>
      <h1 className={styles.title}>Histórico de Semanas</h1>

      <MonthList
        weeksByMonth={weeksByMonth}
        selectedWeekId={selectedWeek?.id}
        onSelectWeek={(week) => {
          if (selectedWeek?.id === week.id) {
            handleDeselectWeek();
            return;
          }

          setSelectedWeek(week);
          fetchTasks(week.id);

          setTimeout(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        }}
      />

      {selectedWeek && (
        <TasksGrid
          tasks={visibleTasks}
          onRetry={handleRetry}
          onDelete={handleDeleteClick}
        />
      )}

      {!selectedWeek && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📅</span>

          <p className={styles.emptyTitle}>Nenhuma semana selecionada</p>

          <p className={styles.emptySubtitle}>
            Selecione uma semana na linha do tempo para visualizar as tarefas
          </p>
        </div>
      )}

      <DeleteHistoryModal
        visible={modalDeleteVisible}
        task={taskToDelete ?? undefined}
        onConfirm={confirmDelete}
        onCancel={() => setModalDeleteVisible(false)}
      />

      <UndoToast
        visible={undoToastVisible}
        taskTitle={lastMovedTask?.title ?? ""}
        onUndo={handleUndoMove}
      />
    </Container>
  );
}