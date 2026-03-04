import { useState } from "react";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function TaskCard({ task, onUpdate, onEdit, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const isClosed = task.week_closed;

  // ✅ Traduções tipadas corretamente
  const statusLabels: Record<Task["status"], string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    done: "Concluída",
  };

  const priorityLabels: Record<Task["priority"], string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

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
      console.error("Erro ao atualizar status:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatDate(date?: string) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  }

  const statusButtonText = task.status === "pending" ? "Começar" : "Finalizar";

  return (
    <div className={`${styles.card} ${styles[task.priority]}`}>
      <div className={styles.header}>
        <div>
          <h3
            className={`${styles.title} ${
              task.status === "done" ? styles.doneTitle : ""
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}
        </div>

        <div className={styles.badges}>
          {task.notify && <span className={styles.notifyBadge}>🔔</span>}

          {/* ✅ Status traduzido */}
          <span className={`${styles.status} ${styles[task.status]}`}>
            {statusLabels[task.status]}
          </span>

          {/* ✅ Prioridade traduzida */}
          <span className={styles.priorityBadge}>
            {priorityLabels[task.priority]}
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.dates}>
        <span>📅 Criado: {formatDate(task.created_at)}</span>
        <span>⏰ Encerra: {formatDate(task.due_date)}</span>
      </div>

      {task.notify && (
        <div className={styles.notifyText}>Notificação ativa</div>
      )}

      {isClosed && <div className={styles.closed}>🔒 Semana encerrada</div>}

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
            onClick={onEdit}
            disabled={loading}
            className={styles.editButton}
          >
            Editar
          </button>

          <button
            onClick={onDelete}
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
