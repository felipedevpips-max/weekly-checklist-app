import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={styles.monthSection}>
      {/* HEADER DO MÊS */}
      <div className={styles.monthHeader} onClick={toggleCollapse}>
        <h3 className={styles.monthTitle}>{month}</h3>

        <span
          className={`${styles.arrow} ${
            collapsed ? styles.arrowCollapsed : ""
          }`}
        >
          ▼
        </span>
      </div>

      {/* SEMANAS */}
      <div
        className={`${styles.weeksContainer} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        {weeks.map((week, index) => {
          const isActive = selectedWeekId === week.id;

          return (
            <div key={week.id} className={styles.timelineRow}>
              <div className={styles.timelineDot}></div>

              <button
                className={isActive ? styles.activeWeek : styles.weekButton}
                onClick={() => onSelectWeek(week)}
              >
                Semana {index + 1}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}