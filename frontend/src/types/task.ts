export type Task = {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  description?: string;   // DESCRIÇÃO
  progress?: number;      // PROGRESSO
  dueDate?: string;       // PRAZO
  notify?: boolean;       // para futuras notificações
};