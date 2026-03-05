import type { Task } from "../../types/task";
import styles from "../../pages/History/history.module.css";
import { TaskCard } from "../TaskCard/TaskCard";

interface Props {
  tasks: Task[];
  onRetry: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TasksGrid({ tasks, onRetry, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className={styles.tasksSection}>
        <p>Nenhuma task encontrada nesta semana.</p>
      </div>
    );
  }

  return (
    <div className={styles.tasksSection}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isWeekClosed={true}
          onRetry={task.status === "pending" ? () => onRetry(task) : undefined}
          onDelete={() => onDelete(task)}
        />
      ))}
    </div>
  );
}
