import type {ISODateString} from '@app-types/common';

const displayDateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const displayDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

export function formatTaskDateTime(value: ISODateString | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return displayDateTime.format(date);
}

export function formatTaskDate(value: ISODateString | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return displayDate.format(date);
}
