import type { Week } from "../types/week";

export function groupWeeksByMonth(weeks: Week[]) {
  const groups: Record<string, Week[]> = {};

  weeks.forEach((week) => {
    const date = new Date(week.start_date);

    const month = date.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(week);
  });

  return groups;
}
