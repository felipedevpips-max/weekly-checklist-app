import { useState } from "react";
import { api } from "../../services/api";
import { BaseModal } from "../BaseModal/BaseModal";
import styles from "./editTaskModal.module.css";
import type { Task } from "../../types/task";

type Props = {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
};

export function EditTaskModal({ task, isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);
  const [notify, setNotify] = useState(task.notify);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!title || !priority) return;
    setLoading(true);

    try {
      const res = await api.patch<Task>(`/tasks/${task.id}`, {
        title,
        description,
        priority,
        notify,
      });

      onSave?.(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar a task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className={styles.title}>Editar Task</h2>

      <input
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
      />

      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
      />

      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
        >
          <option value="" disabled>
            Selecione prioridade
          </option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />
        Receber notificações
      </label>

      <div className={styles.actions}>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        <button className={styles.cancelButton} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </BaseModal>
  );
}
