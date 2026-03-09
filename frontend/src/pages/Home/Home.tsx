import { useState, useMemo } from "react";
import axios from "axios";
import styles from "./home.module.css";
import type { Task } from "../../types/task";

import { Container } from "../../components/Container/Container";
import { CreateTaskForm } from "../../components/CreateTaskForm/CreateTaskForm";
import { ProgressSection } from "../../components/ProgressSection/ProgressSection";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import { EditTaskModal } from "../../components/EditTaskModal/EditTaskModal";
import { TaskList } from "../../components/Tasklist/TaskList";
import { TaskFilter } from "../../components/TaskFilter/TaskFilter";
import { ConfirmCloseWeekModal } from "../../components/ConfirmCloseWeekModal/ConfirmCloseWeekModal";
import { WeekClosedModal } from "../../components/WeekClosedModal/WeekClosedModal";
import { SkeletonLoader } from "../../components/SkeletonLoader/SkeletonLoader";
import { ErrorState } from "../../components/ErrorState/ErrorState";

import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useTaskActions } from "../../hooks/useTaskActions";
import { api } from "../../services/api";

type FilterType = "all" | "pending" | "in_progress" | "done";

export function Home() {
  const { week, tasks, setTasks, loading, error, refetchWeek } = useCurrentWeek();
  const { createTask, updateTask, deleteTask } = useTaskActions({ setTasks });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [movedTasks, setMovedTasks] = useState<Task[]>([]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  if (loading) {
    return (
      <Container>
        <SkeletonLoader variant="header" count={1} />
        <SkeletonLoader variant="card" count={4} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState message={error} onRetry={refetchWeek} />
      </Container>
    );
  }

  async function handleCloseWeek() {
    if (!week) return;
    try {
      const moved = tasks.filter((task) => task.status === "in_progress");
      await api.post(`/weeks/${week.id}/close`);
      setMovedTasks(moved);
      await refetchWeek();
      setShowWeekModal(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro backend:", error.response?.data);
      } else {
        console.error("Erro inesperado:", error);
      }
    }
  }

  return (
    <Container>
      <h1 className={styles.title}>Checklist Semanal</h1>

      {week && !week.closed && (
        <button className={styles.closeWeekButton} onClick={() => setIsCloseModalOpen(true)}>
          Encerrar Semana
        </button>
      )}

      {week && (
        <p className={styles.weekInfo}>
          Semana atual: {new Date(week.start_date).toLocaleDateString()} —{" "}
          {new Date(week.end_date).toLocaleDateString()}
        </p>
      )}

      <CreateTaskForm onCreate={createTask} />
      <ProgressSection tasks={tasks} />
      <TaskFilter activeFilter={filter} onChange={setFilter} />

      <TaskList
        tasks={filteredTasks}
        isWeekClosed={week?.closed}
        onUpdate={updateTask}
        onEdit={setEditingTask}
        onDelete={setTaskToDelete}
      />

      {editingTask && (
        <EditTaskModal isOpen task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => { updateTask(updatedTask); setEditingTask(null); }}
        />
      )}

      {taskToDelete && (
        <ConfirmDeleteModal isOpen taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => { await deleteTask(taskToDelete.id); setTaskToDelete(null); }}
        />
      )}

      {isCloseModalOpen && (
        <ConfirmCloseWeekModal isOpen
          onClose={() => setIsCloseModalOpen(false)}
          onConfirm={async () => { await handleCloseWeek(); setIsCloseModalOpen(false); }}
        />
      )}

      <WeekClosedModal
        visible={showWeekModal}
        movedTasks={movedTasks}
        onClose={() => setShowWeekModal(false)}
      />
    </Container>
  );
}
