/**
 * Date helpers for task due dates stored as local calendar days (YYYY-MM-DD).
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Local calendar day as YYYY-MM-DD. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string): Date | null {
  if (!isValidCalendarDateString(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

export function startOfLocalDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBeforeLocalToday(value: string): boolean {
  const parsed = parseDateInputValue(value);
  if (!parsed) {
    return false;
  }

  return parsed.getTime() < startOfLocalDay().getTime();
}

/** Human-readable due date, e.g. "Wed, 10 Sep 2026". */
export function formatDueDateLabel(value: string): string {
  const parsed = parseDateInputValue(value);
  if (!parsed) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export {DATE_PATTERN};
