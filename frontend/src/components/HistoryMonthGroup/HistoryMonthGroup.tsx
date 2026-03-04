import type { Week } from "../../types/week";
import styles from "./historyMonthGroup.module.css";

type WeekStats = {
  done: number;
  total: number;
};

type Props = {
  month: string;
  weeks: Week[];
  stats: Record<number, WeekStats>;
  selectedWeekId: number | null;
  onSelect: (week: Week) => void;
};

export function HistoryMonthGroup({
  month,
  weeks,
  stats,
  selectedWeekId,
  onSelect,
}: Props) {
  return (
    <div className={styles.monthGroup}>
      <h2 className={styles.monthTitle}>{month}</h2>

      <div className={styles.weeks}>
        {weeks.map((week) => {
          const stat = stats[week.id] ?? { done: 0, total: 0 };

          const progress =
            stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);

          return (
            <div
              key={week.id}
              className={`${styles.weekCard} ${
                selectedWeekId === week.id ? styles.active : ""
              }`}
              onClick={() => onSelect(week)}
            >
              <div className={styles.weekHeader}>
                <span>
                  {week.start_date} - {week.end_date}
                </span>

                <span className={styles.counter}>
                  {stat.done}/{stat.total}
                </span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
