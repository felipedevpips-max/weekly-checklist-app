import type { Task } from "../../types/task";
import styles from "./TaskCard.module.css";
import { api } from "../../services/api";
import { useState } from "react";

type Props = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(task.progress);

  const handleProgressChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    setLoading(true);
    try {
      const res = await api.patch<Task>(`/tasks/${task.id}`, {
        progress: newProgress,
      });
      onUpdate?.(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStatus = async () => {
    if (task.status === "done") return;
    const newStatus: Task["status"] =
      task.status === "pending" ? "in_progress" : "done";

    setLoading(true);
    try {
      const res = await api.patch<Task>(`/tasks/${task.id}`, {
        status: newStatus,
      });
      onUpdate?.(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      onDelete?.(task.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <span
          className={
            task.priority === "high"
              ? styles.high
              : task.priority === "medium"
                ? styles.medium
                : styles.low
          }
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {task.dueDate && (
        <p className={styles.dueDate}>
          Prazo: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      <div className={styles.progressContainer}>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleProgressChange}
          disabled={loading}
          className={styles.slider}
        />
        <span>{progress}%</span>
      </div>

      <div className={styles.actions}>
        {task.status !== "done" && (
          <button onClick={handleNextStatus} disabled={loading}>
            Próximo status
          </button>
        )}
        <button onClick={handleDelete} disabled={loading}>
          Deletar
        </button>
      </div>
    </div>
  );
}
