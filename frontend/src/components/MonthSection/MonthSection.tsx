import { useState, useEffect } from "react";

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
  // estado inicial lendo localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(`month-collapse-${month}`);
    return saved ? JSON.parse(saved) : true; // fechado por padrão
  });

  // salva quando mudar
  useEffect(() => {
    localStorage.setItem(`month-collapse-${month}`, JSON.stringify(collapsed));
  }, [collapsed, month]);

  const toggleCollapse = () => {
    setCollapsed((prev: boolean) => !prev);
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
                onClick={(e) => {
                  e.stopPropagation(); // evita fechar o mês ao clicar
                  onSelectWeek(week);
                }}
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
