export type Task = {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  progress: number;
  notify?: boolean;
  createdAt: string;
  dueDate?: string;
};