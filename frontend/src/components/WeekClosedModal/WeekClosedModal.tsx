import type { Task } from "../../types/task";
import styles from "./weekClosedModal.module.css";

interface WeekClosedModalProps {
  visible: boolean;
  movedTasks: Task[];
  onClose: () => void;
}

export function WeekClosedModal({
  visible,
  movedTasks,
  onClose,
}: WeekClosedModalProps) {
  if (!visible) return null;

  const hasMovedTasks = movedTasks.length > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          🎉 Semana encerrada com sucesso
        </h2>

        {hasMovedTasks ? (
          <>
            <p className={styles.message}>
              As seguintes tarefas estavam em andamento e foram movidas para a nova semana:
            </p>

            <ul className={styles.taskList}>
              {movedTasks.map((task) => (
                <li key={task.id} className={styles.taskItem}>
                  • {task.title}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.message}>
            Nenhuma tarefa estava em andamento.
            <br />
            🚀 Uma nova semana foi iniciada.
          </p>
        )}

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.confirm}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}