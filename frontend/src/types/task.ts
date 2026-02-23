// frontend/src/types/task.ts
export type Task = {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  progress?: number;       // opcional, pode não vir
  dueDate?: string;        // opcional, sempre sábado
  description?: string;    // opcional, adicionamos agora
  notify?: boolean;        // opcional, futuro para alertas
  createdAt?: string;      // opcional, backend cria automaticamente
};