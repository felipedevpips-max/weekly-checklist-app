import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";
import type { Week } from "../types/week";

export function useCurrentWeek() {
  const [week, setWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeek = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/weeks/current");

      setWeek(res.data.week);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Erro ao buscar semana:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado ao carregar a semana.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  return {
    week,
    tasks,
    setTasks,
    loading,
    error,
    refetchWeek: fetchWeek,
  };
}
