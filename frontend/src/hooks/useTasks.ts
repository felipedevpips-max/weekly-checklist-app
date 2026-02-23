import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await api.get<Task[]>("/tasks");
        setTasks(response.data);
      } catch {
        setError("Erro ao buscar tarefas");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  return { tasks, loading, error };
}
