import type { Task } from "../../types/task";
import styles from "./DeleteHistoryModal.module.css";

interface DeleteHistoryModalProps {
  visible: boolean;
  task?: Task;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteHistoryModal({ visible, task, onConfirm, onCancel }: DeleteHistoryModalProps) {
  if (!visible || !task) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Confirmar exclusão</h2>
        <p className={styles.message}>
          Deseja realmente deletar a task: <span className={styles.taskTitle}>{task.title}</span>?
        </p>
        <div className={styles.buttons}>
          <button onClick={onCancel} className={styles.cancel}>Cancelar</button>
          <button onClick={onConfirm} className={styles.delete}>Deletar</button>
        </div>
      </div>
    </div>
  );
}