import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";
import type { Week } from "../types/week";

export function useCurrentWeek() {
  const [week, setWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeek = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/weeks/current");

      setWeek(res.data.week);
      setTasks(res.data.tasks);
    } catch (error) {
      console.error("Erro ao buscar semana:", error);
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
    refetchWeek: fetchWeek, // 👈 AGORA EXISTE
  };
}
