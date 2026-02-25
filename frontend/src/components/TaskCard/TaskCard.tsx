import type { Task } from "../../types/task";
import { useState } from "react";
import { api } from "../../services/api";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleNextStatus = async () => {
    let newStatus: Task["status"];
    if (task.status === "pending") newStatus = "in_progress";
    else if (task.status === "in_progress") newStatus = "done";
    else return;

    setLoading(true);
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

  const statusButtonText =
    task.status === "pending" ? "Começar" : "Finalizar Tarefa";
  const statusButtonClass =
    task.status === "pending" ? styles.startButton : styles.finishButton;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{task.title}</h3>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

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

      {task.notify && (
        <div className={styles.notify}>🔔 Recebe notificações</div>
      )}

      <div className={styles.actions}>
        {task.status !== "done" && (
          <button
            onClick={handleNextStatus}
            disabled={loading}
            className={statusButtonClass}
          >
            {statusButtonText}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className={styles.deleteButton}
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
