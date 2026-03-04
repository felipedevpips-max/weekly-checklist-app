import { useCallback } from "react";
import type { Task } from "../types/task";
import { api } from "../services/api";

interface UseTaskActionsProps {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function useTaskActions({ setTasks }: UseTaskActionsProps) {
  /* CREATE */
  const createTask = useCallback((newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  }, [setTasks]);

  /* UPDATE */
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, [setTasks]);

  /* DELETE */
  const deleteTask = useCallback(async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }, [setTasks]);

  return {
    createTask,
    updateTask,
    deleteTask,
  };
}