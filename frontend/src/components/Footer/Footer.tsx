import styles from "./footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.logo}>Weekify</p>

        <p className={styles.description}>
          Sistema de gerenciamento semanal de tarefas para organizar metas e
          acompanhar progresso.
        </p>

        <p className={styles.tech}>
          Desenvolvido com React, TypeScript, Node.js, Express e PostgreSQL
        </p>

        <p className={styles.copy}>
          © {year} Weekify — Projeto de estudo Fullstack
        </p>
      </div>
    </footer>
  );
}