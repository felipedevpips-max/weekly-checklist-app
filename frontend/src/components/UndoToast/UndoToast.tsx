import styles from "./undoToast.module.css";

interface UndoToastProps {
  visible: boolean;
  taskTitle: string;
  onUndo: () => void;
}

export function UndoToast({ visible, taskTitle, onUndo }: UndoToastProps) {
  if (!visible) return null;

  return (
    <div className={styles.toast}>
      <span className={styles.message}>
        Tarefa <strong>{taskTitle}</strong> movida para a semana aberta
      </span>

      <button onClick={onUndo} className={styles.undoButton}>
        Desfazer
      </button>
    </div>
  );
}