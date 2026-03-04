import type { Task } from "../../types/task";
import styles from "./moveHistoryModal.module.css";

interface MoveHistoryModalProps {
  visible: boolean;
  tasks: Task[];
  onClose: () => void;
}

export function MoveHistoryModal({ visible, tasks, onClose }: MoveHistoryModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Tarefas movidas para a semana aberta</h2>
        <ul className={styles.taskList}>
          {tasks.map((t) => (
            <li key={t.id} className={styles.taskTitle}>
              {t.title}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={styles.okButton}>
          OK
        </button>
      </div>
    </div>
  );
}