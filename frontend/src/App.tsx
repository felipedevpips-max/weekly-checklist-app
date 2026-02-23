import styles from "./App.module.css";
import { useTasks } from "./hooks/useTasks";
import { TaskCard } from "./components/TaskCard";

function App() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Weekly Checklist</h1>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default App;
