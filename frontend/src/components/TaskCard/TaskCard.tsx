import { useState, useEffect } from "react";
import type { Task } from "../../types/task";
import { api } from "../../services/api";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
  isWeekClosed?: boolean; // Bloqueio de edição
  onUpdate?: (task: Task) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function TaskCard({
  task,
  isWeekClosed = false,
  onUpdate,
  onEdit,
  onDelete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [animateDone, setAnimateDone] = useState(false);

  useEffect(() => {
    if (task.status === "done") {
      setAnimateDone(true);
      const timer = setTimeout(() => setAnimateDone(false), 500);
      return () => clearTimeout(timer);
    }
  }, [task.status]);

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
    if (isWeekClosed) return;

    let newStatus: Task["status"];
    if (task.status === "pending") newStatus = "in_progress";
    else if (task.status === "in_progress") newStatus = "done";
    else return;

    setLoading(true);
    try {
      const res = await api.patch(`/tasks/${task.id}`, { status: newStatus });
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
    <div
      className={`${styles.card} ${styles[task.priority]} ${
        task.status === "done" ? styles.doneCard : ""
      } ${animateDone ? styles.pulse : ""}`}
    >
      {/* Header */}
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
          <span className={`${styles.status} ${styles[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          <span className={styles.priorityBadge}>
            {priorityLabels[task.priority]}
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Datas */}
      <div className={styles.dates}>
        <span>📅 Criado: {formatDate(task.created_at)}</span>
        <span>⏰ Encerra: {formatDate(task.due_date)}</span>
      </div>

      {task.notify && (
        <div className={styles.notifyText}>Notificação ativa</div>
      )}

      {/* Semana fechada */}
      {isWeekClosed && <div className={styles.closed}>🔒 Semana encerrada</div>}

      {/* Ações */}
      {!isWeekClosed && (
        <div className={styles.actions}>
          {task.status !== "done" && (
            <button
              onClick={handleNextStatus}
              disabled={loading || isWeekClosed}
              className={`${styles.primaryButton} ${
                isWeekClosed ? styles.disabled : ""
              }`}
            >
              {statusButtonText}
            </button>
          )}

          <button
            onClick={onEdit}
            disabled={loading || isWeekClosed}
            className={`${styles.editButton} ${isWeekClosed ? styles.disabled : ""}`}
          >
            Editar
          </button>

          <button
            onClick={onDelete}
            disabled={loading || isWeekClosed}
            className={`${styles.deleteButton} ${isWeekClosed ? styles.disabled : ""}`}
          >
            Deletar
          </button>
        </div>
      )}
    </div>
  );
}
