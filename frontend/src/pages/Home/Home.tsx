import { useState, useMemo } from "react";
import styles from "./home.module.css";
import type { Task } from "../../types/task";

import { Container } from "../../components/Container/Container";
import { CreateTaskForm } from "../../components/CreateTaskForm/CreateTaskForm";
import { ProgressSection } from "../../components/ProgressSection/ProgressSection";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import { EditTaskModal } from "../../components/EditTaskModal/EditTaskModal";
import { TaskList } from "../../components/Tasklist/TaskList";
import { TaskFilter } from "../../components/TaskFilter/TaskFilter";
import { WeekCountdown } from "../../components/WeekCountdown/WeekCountdown";
import { SkeletonLoader } from "../../components/SkeletonLoader/SkeletonLoader";
import { ErrorState } from "../../components/ErrorState/ErrorState";

import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useTaskActions } from "../../hooks/useTaskActions";

type FilterType = "all" | "pending" | "in_progress" | "done";

export function Home() {
  const { week, tasks, setTasks, loading, error, refetchWeek } = useCurrentWeek();
  const { createTask, updateTask, deleteTask } = useTaskActions({ setTasks });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

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

  return (
    <Container>
      <h1 className={styles.title}>Checklist Semanal</h1>

      {week && (
        <div className={styles.weekHeader}>
          <p className={styles.weekInfo}>
            Semana atual: {new Date(week.start_date).toLocaleDateString("pt-BR")} —{" "}
            {new Date(week.end_date).toLocaleDateString("pt-BR")}
          </p>
          {!week.closed && <WeekCountdown endDate={week.end_date} />}
          {week.closed && (
            <div className={styles.weekClosed}>
              🔒 Esta semana foi encerrada. As tarefas não concluídas foram movidas para a semana atual.
            </div>
          )}
        </div>
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
        <EditTaskModal
          isOpen
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            updateTask(updatedTask);
            setEditingTask(null);
          }}
        />
      )}

      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen
          taskTitle={taskToDelete.title}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => {
            await deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }}
        />
      )}
    </Container>
  );
}
