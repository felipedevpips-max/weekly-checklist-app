import styles from "./confirmDeleteModal.module.css";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, taskTitle }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Excluir tarefa</h2>

        <p className={styles.message}>
          Tem certeza que deseja excluir:
          <span className={styles.taskTitle}>{taskTitle}</span>
        </p>

        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>

          <button className={styles.delete} onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}