import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";
import { DeleteHistoryModal } from "../../components/DeleteHistoryModal/DeleteHistoryModal";
import { UndoToast } from "../../components/UndoToast/UndoToast";
import { SkeletonLoader } from "../../components/SkeletonLoader/SkeletonLoader";
import { ErrorState } from "../../components/ErrorState/ErrorState";
import styles from "./history.module.css";
import { MonthList } from "../../components/MonthList/MonthList";
import { TasksGrid } from "../../components/TasksGrid/TasksGrid";
import { groupWeeksByMonth } from "../../utils/groupWeeksByMonth";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [lastMovedTask, setLastMovedTask] = useState<Task | null>(null);
  const [lastWeekId, setLastWeekId] = useState<number | null>(null);

  const weeksByMonth = groupWeeksByMonth(weeks);

  const fetchTasks = useCallback(async (weekId: number) => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const res = await api.get(`/weeks/${weekId}/tasks`);
      setTasks(res.data);
    } catch {
      setTasksError("Não foi possível carregar as tarefas desta semana.");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchWeeks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/weeks");
      setWeeks(res.data.filter((w: Week) => w.closed));
    } catch {
      setError("Não foi possível carregar o histórico. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const handleRetry = async (task: Task) => {
    if (!selectedWeek) return;
    await api.post(`/weeks/open/tasks`, { taskId: task.id });
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setLastMovedTask(task);
    setLastWeekId(selectedWeek.id);
    setUndoToastVisible(true);
  };

  const handleUndoMove = async () => {
    if (!lastMovedTask || !lastWeekId) return;
    await api.post("/weeks/move-back", {
      taskId: lastMovedTask.id,
      weekId: lastWeekId,
    });
    await fetchTasks(lastWeekId);
    setUndoToastVisible(false);
    setLastMovedTask(null);
    setLastWeekId(null);
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
      setLastMovedTask(null);
      setLastWeekId(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [undoToastVisible]);

  if (loading) {
    return (
      <Container>
        <SkeletonLoader variant="header" count={1} />
        <SkeletonLoader variant="card" count={5} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState message={error} onRetry={fetchWeeks} />
      </Container>
    );
  }

  return (
    <Container>
      <h1 className={styles.title}>Histórico de Semanas</h1>

      <MonthList
        weeksByMonth={weeksByMonth}
        selectedWeekId={selectedWeek?.id}
        onSelectWeek={(week) => {
          if (selectedWeek?.id === week.id) {
            setSelectedWeek(null);
            setTasks([]);
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

      {tasksLoading && <SkeletonLoader variant="card" count={3} />}

      {tasksError && !tasksLoading && selectedWeek && (
        <ErrorState
          message={tasksError}
          onRetry={() => fetchTasks(selectedWeek.id)}
        />
      )}

      {selectedWeek && !tasksLoading && !tasksError && (
        <TasksGrid
          tasks={visibleTasks}
          onRetry={handleRetry}
          onDelete={(task) => {
            setTaskToDelete(task);
            setModalDeleteVisible(true);
          }}
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
