export type TaskStatus = "pending" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: number;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  notify: boolean;

  // datas (formato do backend postgres)
  created_at: string;

  due_date?: string;

  completed_at?: string;

  // relacionamento com semana
  week_id: number;

  week_closed: boolean;
};
