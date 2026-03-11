import styles from "./serverWarmup.module.css";

export function ServerWarmup() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <h2 className={styles.title}>Iniciando servidor...</h2>
        <p className={styles.message}>
          O servidor estava em repouso e está acordando. <br />
          Isso pode levar até <strong>30 segundos</strong> na primeira vez.
        </p>
        <div className={styles.bar}>
          <div className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
