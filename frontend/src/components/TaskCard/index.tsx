import type { Task } from "../../types/task";
import styles from "./taskcard.module.css";

type Props = {
  task: Task;
};

export function TaskCard({ task }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{task.title}</div>

      <div className={styles.meta}>
        <span className={styles.status}>{task.status}</span>

        <span
          className={
            task.priority === "high"
              ? styles.high
              : task.priority === "medium"
                ? styles.medium
                : styles.low
          }
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}
