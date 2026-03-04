import { TaskCard } from "../TaskCard/TaskCard";
import type { Task } from "../../types/task";

interface Props {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onUpdate, onEdit, onDelete }: Props) {
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