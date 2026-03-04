import styles from "./progressSection.module.css";
import type { Task } from "../../types/task";

interface Props {
  tasks: Task[];
}

export function ProgressSection({ tasks }: Props) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const progressPercentage =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressHeader}>
        <span className={styles.progressTitle}>Progresso da semana</span>
        <span className={styles.progressPercentage}>
          {progressPercentage}%
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${
            progressPercentage === 100 ? styles.progressComplete : ""
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className={styles.progressInfo}>
        {doneTasks} de {totalTasks} tarefas concluídas
      </div>
    </div>
  );
}