import { useState } from "react";
import { api } from "../../services/api";
import styles from "./CreateTaskForm.module.css";
import type { Task } from "../../types/task";

type Props = {
  onCreate: (task: Task) => void;
};

export function CreateTaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"" | "low" | "medium" | "high">("");
  const [description, setDescription] = useState("");
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);

  function getNextSaturday(): string {
    const today = new Date();
    const diff = 6 - today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (diff >= 0 ? diff : diff + 7));
    return saturday.toISOString();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priority) return;

    setLoading(true);

    try {
      const newTask = {
        title,
        priority,
        description,
        notify,
        progress: 0,
        status: "pending",
        dueDate: getNextSaturday(),
      };

      const res = await api.post<Task>("/tasks", newTask);
      onCreate(res.data);

      setTitle("");
      setDescription("");
      setPriority("");
      setNotify(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>Criar nova tarefa</h2>
      </div>

      <div className={styles.divider} />

      <div className={styles.field}>
        <label>Título</label>
        <input
          type="text"
          placeholder="Ex: Estudar React"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Prioridade</label>
        <div className={styles.selectWrapper}>
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            className={styles.select}
          >
            <option value="" disabled>
              Selecione
            </option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <span className={styles.selectArrow}>⌄</span>
        </div>
      </div>

      <div className={styles.field}>
        <label>Descrição</label>
        <textarea
          placeholder="Detalhes da tarefa..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />
        <span>Receber notificações</span>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Tarefa"}
      </button>
    </form>
  );
}