import type { Task } from "../../types/task";
import styles from "./taskcard.module.css";
import { api } from "../../services/api";
import { useState } from "react";

type Props = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleNextStatus = async () => {
    if (task.status === "done") return;

    setLoading(true);
    const newStatus: Task["status"] =
      task.status === "pending" ? "in_progress" : "done";

    try {
      const res = await api.patch(`/tasks/${task.id}`, { status: newStatus });
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
      <div className={styles.title}>{task.title}</div>

      <div className={styles.meta}>
        <span className={styles.status}>{task.status}</span>

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

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <span>{task.progress}%</span>
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

      {task.dueDate && (
        <div className={styles.dueDate}>
          Prazo: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
