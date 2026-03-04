import styles from "./taskFilter.module.css";

type FilterType = "all" | "pending" | "in_progress" | "done";

interface Props {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
}

export function TaskFilter({ activeFilter, onChange }: Props) {
  const filters: { label: string; value: FilterType }[] = [
    { label: "Todas", value: "all" },
    { label: "Pendentes", value: "pending" },
    { label: "Em progresso", value: "in_progress" },
    { label: "Concluídas", value: "done" },
  ];

  return (
    <div className={styles.filterWrapper}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`${styles.filterButton} ${
            activeFilter === filter.value ? styles.active : ""
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}