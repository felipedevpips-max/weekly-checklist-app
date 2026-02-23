export type Task = {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
};