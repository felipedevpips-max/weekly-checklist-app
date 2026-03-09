import styles from "./errorState.module.css";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>{message}</p>
      <button className={styles.button} onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}
