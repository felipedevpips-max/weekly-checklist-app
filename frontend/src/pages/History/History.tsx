import { useState, useEffect, useCallback } from "react";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import { Container } from "../../components/Container/Container";

import { DeleteHistoryModal } from "../../components/DeleteHistoryModal/DeleteHistoryModal";
import { MoveHistoryModal } from "../../components/MoveHistoryModal/MoveHistoryModal";

import styles from "./history.module.css";
import { MonthList } from "../../components/MonthList/MonthList";
import { TasksGrid } from "../../components/TasksGrid/TasksGrid";
import { groupWeeksByMonth } from "../../utils/groupWeeksByMonth";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalMoveVisible, setModalMoveVisible] = useState(false);
  const [modalMoveTasks, setModalMoveTasks] = useState<Task[]>([]);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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

      if (closedWeeks.length > 0) {
        setSelectedWeek(closedWeeks[0]);
        fetchTasks(closedWeeks[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const handleRetry = async (task: Task) => {
    await api.post(`/weeks/open/tasks`, { taskId: task.id });

    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    setModalMoveTasks([task]);
    setModalMoveVisible(true);
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
        }}
      />

      {selectedWeek && (
        <TasksGrid
          tasks={visibleTasks}
          onRetry={handleRetry}
          onDelete={handleDeleteClick}
        />
      )}

      <MoveHistoryModal
        visible={modalMoveVisible}
        tasks={modalMoveTasks}
        onClose={() => setModalMoveVisible(false)}
      />

      <DeleteHistoryModal
        visible={modalDeleteVisible}
        task={taskToDelete ?? undefined}
        onConfirm={confirmDelete}
        onCancel={() => setModalDeleteVisible(false)}
      />

      {!selectedWeek && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📅</span>

          <p className={styles.emptyTitle}>Nenhuma semana selecionada</p>

          <p className={styles.emptySubtitle}>
            Selecione uma semana na linha do tempo para visualizar as tarefas
          </p>
        </div>
      )}
    </Container>
  );
}
