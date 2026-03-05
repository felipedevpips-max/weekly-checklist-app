import type { Week } from "../../types/week";
import styles from "./monthSection.module.css";

interface Props {
  month: string;
  weeks: Week[];
  selectedWeekId?: number;
  onSelectWeek: (week: Week) => void;
}

export function MonthSection({
  month,
  weeks,
  selectedWeekId,
  onSelectWeek,
}: Props) {
  return (
    <div className={styles.monthSection}>
      <h3 className={styles.monthTitle}>{month}</h3>

      <div className={styles.weeksRow}>
        {weeks.map((week, index) => (
          <button
            key={week.id}
            className={
              selectedWeekId === week.id ? styles.activeWeek : styles.weekButton
            }
            onClick={() => onSelectWeek(week)}
          >
            Semana {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
