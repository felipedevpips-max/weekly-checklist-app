import { BaseModal } from "../BaseModal/BaseModal";
import styles from "./confirmDeleteModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, taskTitle }: Props) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className={styles.title}>Excluir tarefa</h2>
      <p className={styles.message}>
        Tem certeza que deseja excluir:
        <span className={styles.taskTitle}>{taskTitle}</span>
      </p>

      <div className={styles.buttons}>
        <button className={styles.delete} onClick={onConfirm}>Excluir</button>
        <button className={styles.cancel} onClick={onClose}>Cancelar</button>
      </div>
    </BaseModal>
  );
}