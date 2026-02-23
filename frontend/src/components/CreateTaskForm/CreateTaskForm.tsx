import { useState } from "react";
import { api } from "../../services/api";
import type { Task } from "../../types/task";
import styles from "./CreateTaskForm.module.css";

type Props = { onCreate: (task: Task) => void };

export function CreateTaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("low");
  const [description, setDescription] = useState("");
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);

  const priorities: Task["priority"][] = ["low", "medium", "high"];

  function getNextSaturday(): string {
    const today = new Date();
    const diff = 6 - today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (diff >= 0 ? diff : diff + 7));
    return saturday.toISOString();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      const newTask = {
        title,
        priority,
        description,
        notify,
        progress: 0,
        status: "pending" as const,
        dueDate: getNextSaturday(),
      };
      const res = await api.post<Task>("/tasks", newTask);
      onCreate(res.data);

      setTitle("");
      setDescription("");
      setPriority("low");
      setNotify(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título da tarefa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Task["priority"])}
      >
        {priorities.map((p) => (
          <option key={p} value={p}>
            {p === "low" ? "Baixa" : p === "medium" ? "Média" : "Alta"}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />
        Receber notificações
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Tarefa"}
      </button>
    </form>
  );
}