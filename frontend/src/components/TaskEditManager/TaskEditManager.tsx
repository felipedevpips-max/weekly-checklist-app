import { useState } from "react";
import { EditTaskModal } from "../EditTaskModal/EditTaskModal";
import type { Task } from "../../types/task";

type Props = {
  children: (openEdit: (task: Task) => void) => React.ReactNode;
  onUpdate?: (task: Task) => void;
};

export function TaskEditManager({ children, onUpdate }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <>
      {children((task) => setEditingTask(task))}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            onUpdate?.(updatedTask);
            setEditingTask(null);
          }}
        />
      )}
    </>
  );
}
