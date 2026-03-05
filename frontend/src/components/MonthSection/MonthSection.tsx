import { useState } from "react";
import type { Week } from "../../types/week";
import { getWeekNumber } from "../../utils/getWeekNumber";
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

  // verifica se existe semana ativa neste mês
  const hasActiveWeek = weeks.some((w) => w.id === selectedWeekId);

  // estado inicial com localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(`month-collapse-${month}`);

    if (saved !== null) {
      return JSON.parse(saved);
    }

    // padrão: fechado (exceto se tiver semana ativa)
    return !hasActiveWeek;
  });

  const toggleCollapse = () => {
    setCollapsed((prev: boolean) => {
      const newValue = !prev;

      localStorage.setItem(
        `month-collapse-${month}`,
        JSON.stringify(newValue)
      );

      return newValue;
    });
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

      {/* LISTA DE SEMANAS */}
      <div
        className={`${styles.weeksContainer} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        {weeks.map((week) => {
          const isActive = selectedWeekId === week.id;

          return (
            <div key={week.id} className={styles.timelineRow}>
              
              <div className={styles.timelineDot}></div>

              <button
                className={
                  isActive ? styles.activeWeek : styles.weekButton
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWeek(week);
                }}
              >
                Semana {getWeekNumber(week.start_date)}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}