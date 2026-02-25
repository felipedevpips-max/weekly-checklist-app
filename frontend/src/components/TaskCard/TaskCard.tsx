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

  const isClosed = task.week_closed;

  // ============================
  // ALTERAR STATUS
  // ============================

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETAR
  // ============================

  const handleDelete = async () => {
    if (isClosed) return;

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

  // ============================
  // TEXTO BOTÃO
  // ============================

  const statusButtonText = task.status === "pending" ? "Começar" : "Finalizar";

  const statusButtonClass =
    task.status === "pending" ? styles.startButton : styles.finishButton;

  // ============================
  // FORMATAÇÃO DATA
  // ============================

  function formatDate(date?: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className={styles.card}>
      {/* TITULO */}

      <h3 className={styles.title}>{task.title}</h3>

      {/* DESCRIÇÃO */}

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {/* PRIORIDADE + STATUS */}

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

      {/* DATAS */}

      <div className={styles.dates}>
        <span>
          📅 Criado:
          {formatDate(task.created_at)}
        </span>

        <span>
          ⏰ Encerra:
          {formatDate(task.due_date)}
        </span>
      </div>

      {/* NOTIFICAÇÃO */}

      {task.notify && (
        <div className={styles.notify}>🔔 Notificações ativas</div>
      )}

      {/* BLOQUEIO */}

      {isClosed && <div className={styles.closed}>🔒 Semana encerrada</div>}

      {/* AÇÕES */}

      {!isClosed && (
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
      )}
    </div>
  );
}
