export type CreateTaskDTO = {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  notify: boolean;
  due_date?: string;
};
