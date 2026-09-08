import type {ISODateString} from '@app-types/common';

export function toISODateString(date: Date = new Date()): ISODateString {
  return date.toISOString();
}

export function fromISODateString(value: ISODateString): Date {
  return new Date(value);
}
