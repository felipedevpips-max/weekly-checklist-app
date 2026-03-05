import type { Week } from "../../types/week";
import styles from "./monthList.module.css";
import { MonthSection } from "../MonthSection/MonthSection";

interface Props {
  weeksByMonth: Record<string, Week[]>;
  selectedWeekId?: number;
  onSelectWeek: (week: Week) => void;
}

export function MonthList({
  weeksByMonth,
  selectedWeekId,
  onSelectWeek,
}: Props) {
  return (
    <div className={styles.monthsWrapper}>
      {Object.entries(weeksByMonth).map(([month, monthWeeks]) => (
        <MonthSection
          key={month}
          month={month}
          weeks={monthWeeks}
          selectedWeekId={selectedWeekId}
          onSelectWeek={onSelectWeek}
        />
      ))}
    </div>
  );
}
