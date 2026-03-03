import { useState } from "react";
import type { Task } from "../../types/task";
import { EditTaskModal } from "../EditTaskModal/EditTaskModal";

type Props = {
  children: (openEdit: (task: Task) => void) => React.ReactNode;
  onUpdate?: (task: Task) => void;
};

export function TaskEditManager({ children, onUpdate }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <>
      {/* Renderiza os elementos filhos passando a função de abrir edição */}
      {children((task) => setEditingTask(task))}

      {/* Modal de edição */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask} // <- agora obrigatório para BaseModal
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
