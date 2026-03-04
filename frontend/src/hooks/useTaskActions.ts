import { useState, useEffect, useCallback } from "react";
import type { Task } from "../types/task";
import { api } from "../services/api";

interface UseTaskActionsProps {
  initialTasks: Task[];
}

export function useTaskActions({ initialTasks }: UseTaskActionsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 🔥 sincroniza automaticamente quando backend responde
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  /* CREATE */
  const createTask = useCallback((newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  /* UPDATE */
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, []);

  /* DELETE */
  const deleteTask = useCallback(async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);

      // 🔥 refetch real
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }, []);

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
  };
}