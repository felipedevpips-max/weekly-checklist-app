import { BaseModal } from "../BaseModal/BaseModal";
import styles from "./confirmCloseWeekModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmCloseWeekModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className={styles.title}>Encerrar Semana</h2>
      <p className={styles.message}>
        Tem certeza que deseja encerrar esta semana? Esta ação não pode ser desfeita.
      </p>

      <div className={styles.buttons}>
        <button className={styles.cancel} onClick={onClose}>Cancelar</button>
        <button className={styles.confirm} onClick={onConfirm}>Encerrar</button>
      </div>
    </BaseModal>
  );
}