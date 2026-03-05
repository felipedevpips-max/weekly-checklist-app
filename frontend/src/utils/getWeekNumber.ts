export function getWeekNumber(dateString: string): number {
  const date = new Date(dateString);

  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;

  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);

  const diff =
    target.getTime() -
    firstThursday.getTime();

  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}