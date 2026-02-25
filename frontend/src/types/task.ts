export type Task = {
  id: number;

  title: string;

  description: string;

  status: "pending" | "in_progress" | "done";

  priority: "low" | "medium" | "high";

  due_date: string;

  created_at: string;

  notify: boolean;

  week_id: number;

  week_closed?: boolean;
};
