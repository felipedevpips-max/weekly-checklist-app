import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";
import type { Week } from "../types/week";

export function useCurrentWeek() {
  const [week, setWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeek() {
      const res = await api.get("/weeks/current");

      setWeek(res.data.week);
      setTasks(res.data.tasks);
      setLoading(false);
    }

    fetchWeek();
  }, []);

  return {
    week,
    tasks,
    setTasks,
    loading,
  };
}
