import type { Task } from "../../types/task";
import { useState } from "react";
import { api } from "../../services/api";
import styles from "./TaskCard.module.css";

import { EditTaskModal } from "../EditTaskModal/EditTaskModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal/ConfirmDeleteModal";

type Props = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const isClosed = task.week_closed;

  const handleNextStatus = async () => {
    if (isClosed) return;

    let newStatus: Task["status"];

    if (task.status === "pending") newStatus = "in_progress";
    else if (task.status === "in_progress") newStatus = "done";
    else return;

    setLoading(true);

    try {
      const res = await api.patch(`/tasks/${task.id}`, {
        status: newStatus,
      });

      onUpdate?.(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isClosed) return;

    setLoading(true);

    try {
      await api.delete(`/tasks/${id}`);
      onDelete?.(id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function formatDate(date?: string) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  }

  const statusButtonText =
    task.status === "pending" ? "Começar" : "Finalizar";

  return (
    <div className={`${styles.card} ${styles[task.priority]}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{task.title}</h3>
          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}
        </div>

        <div className={styles.badges}>
          {task.notify && (
            <span className={styles.notifyBadge}>🔔</span>
          )}

          <span className={`${styles.status} ${styles[task.status]}`}>
            {task.status}
          </span>

          <span className={`${styles.priorityBadge}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.dates}>
        <span>📅 Criado: {formatDate(task.created_at)}</span>
        <span>⏰ Encerra: {formatDate(task.due_date)}</span>
      </div>

      {task.notify && (
        <div className={styles.notifyText}>
          Notificação ativa
        </div>
      )}

      {isClosed && (
        <div className={styles.closed}>
          🔒 Semana encerrada
        </div>
      )}

      {!isClosed && (
        <div className={styles.actions}>
          {task.status !== "done" && (
            <button
              onClick={handleNextStatus}
              disabled={loading}
              className={styles.primaryButton}
            >
              {statusButtonText}
            </button>
          )}

          <button
            onClick={() => setEditing(task)}
            disabled={loading}
            className={styles.editButton}
          >
            Editar
          </button>

          <button
            onClick={() => setOpenConfirm(true)}
            disabled={loading}
            className={styles.deleteButton}
          >
            Deletar
          </button>
        </div>
      )}

      {editing && (
        <EditTaskModal
          task={editing}
          onClose={() => setEditing(null)}
          onSave={(updatedTask) => {
            onUpdate?.(updatedTask);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={openConfirm}
        taskTitle={task.title}
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          handleDelete(task.id);
          setOpenConfirm(false);
        }}
      />
    </div>
  );
}