import { useEffect, useState } from "react";

import { api } from "../../services/api";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import type { Week } from "../../types/week";
import type { Task } from "../../types/task";

export function History() {
  const [weeks, setWeeks] = useState<Week[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.get("/weeks").then((res) => setWeeks(res.data));
  }, []);

  async function loadTasks(id: number) {
    const res = await api.get(`/weeks/${id}/tasks`);

    setTasks(res.data);
  }

  return (
    <>
      <h1>Histórico</h1>

      {weeks.map((w) => (
        <button key={w.id} onClick={() => loadTasks(w.id)}>
          {new Date(w.start_date).toLocaleDateString()}
          {" - "}
          {new Date(w.end_date).toLocaleDateString()}
        </button>
      ))}

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </>
  );
}
