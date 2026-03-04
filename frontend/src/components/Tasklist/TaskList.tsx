import { TaskCard } from "../TaskCard/TaskCard";
import type { Task } from "../../types/task";
import styles from "./taskList.module.css";

interface Props {
  tasks: Task[];
  isWeekClosed?: boolean;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onUpdate, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>

        <h3 className={styles.emptyTitle}>Nenhuma tarefa criada</h3>

        <p className={styles.emptyText}>
          Comece adicionando sua primeira tarefa acima e organize sua semana com
          mais clareza.
        </p>
      </div>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
        />
      ))}
    </>
  );
}
