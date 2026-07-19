import dayjs, { type ConfigType, type Dayjs, type OpUnitType } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type { Dayjs };
export { dayjs };

export function toDayjs(value: ConfigType | null | undefined): Dayjs | null {
  if (value == null || value === '') return null;
  const next = dayjs(value);
  return next.isValid() ? next : null;
}

export function formatCommitted(value: Dayjs | null | undefined, format: string): string {
  return value?.isValid() ? value.format(format) : '';
}

export function sanitizeDateTyping(raw: string): string {
  return raw.replace(/[^\d/\-:.~ ]/g, '');
}

function normalizeSeparatorsForParse(s: string, fmt: string): string {
  const fmtHasSlash = fmt.includes('/');
  const fmtHasDash = fmt.includes('-');
  if (fmtHasSlash && !fmtHasDash) return s.replace(/-/g, '/');
  if (fmtHasDash && !fmtHasSlash) return s.replace(/\//g, '-');
  return s;
}

export function parseCommitted(
  raw: string,
  format: string,
  unit: OpUnitType = 'day',
): Dayjs | null {
  const trimmed = sanitizeDateTyping(raw).trim();
  if (!trimmed) return null;

  const normalized = normalizeSeparatorsForParse(trimmed, format);
  let parsed = dayjs(normalized, format, true);
  if (!parsed.isValid() && (format.includes('DD') || format.includes('MM'))) {
    const lenient = format.replace(/DD/g, 'D').replace(/MM/g, 'M');
    if (lenient !== format) parsed = dayjs(normalized, lenient, true);
  }
  if (!parsed.isValid()) return null;
  return unit === 'minute' || unit === 'second' || unit === 'hour'
    ? parsed.second(0).millisecond(0)
    : parsed.startOf(unit);
}

export function toBoundDayjs(bound: Dayjs | string | null | undefined): Dayjs | null {
  if (bound == null || bound === '') return null;
  if (dayjs.isDayjs(bound)) return bound.isValid() ? bound : null;
  const asDay = dayjs(bound, 'YYYY-MM-DD', true);
  if (asDay.isValid()) return asDay.startOf('day');
  const parsed = dayjs(bound);
  return parsed.isValid() ? parsed : null;
}

export function isWithinRange(
  value: Dayjs,
  minDate?: Dayjs | string | null,
  maxDate?: Dayjs | string | null,
  unit: OpUnitType = 'day',
): boolean {
  const min = toBoundDayjs(minDate);
  const max = toBoundDayjs(maxDate);
  if (min && value.isBefore(min, unit)) return false;
  if (max && value.isAfter(max, unit)) return false;
  return true;
}

/** Keep date from `base`, replace time parts. */
export function withTime(
  base: Dayjs | null | undefined,
  hour: number,
  minute: number,
  second = 0,
): Dayjs {
  const anchor = base?.isValid() ? base : dayjs();
  return anchor.hour(hour).minute(minute).second(second).millisecond(0);
}

/** Keep time from `base`, replace calendar day. */
export function withDate(base: Dayjs | null | undefined, date: Dayjs): Dayjs {
  const hour = base?.isValid() ? base.hour() : 0;
  const minute = base?.isValid() ? base.minute() : 0;
  return date.startOf('day').hour(hour).minute(minute).second(0).millisecond(0);
}

export function dayjsValueKey(value: Dayjs | null | undefined, format: string): string {
  return value?.isValid() ? value.format(format) : '';
}

export function rangeValueKey(
  value: [Dayjs, Dayjs] | null | undefined,
  format: string,
): string {
  if (!value?.[0]?.isValid() || !value[1]?.isValid()) return '';
  return `${value[0].format(format)}|${value[1].format(format)}`;
}

export function formatRangeCommitted(
  value: [Dayjs, Dayjs] | null | undefined,
  format: string,
  separator = ' ~ ',
): string {
  if (!value?.[0]?.isValid() || !value[1]?.isValid()) return '';
  return `${value[0].format(format)}${separator}${value[1].format(format)}`;
}

export function parseRangeCommitted(
  raw: string,
  format: string,
  separator = '~',
): [Dayjs, Dayjs] | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(separator).map((part) => part.trim());
  if (parts.length !== 2) return null;

  const start = parseCommitted(parts[0]!, format, 'day');
  const end = parseCommitted(parts[1]!, format, 'day');
  if (!start || !end || end.isBefore(start, 'day')) return null;
  return [start, end];
}

export function buildMonthCells(month: Dayjs): Dayjs[] {
  const start = month.startOf('month').startOf('week');
  const end = month.endOf('month').endOf('week');
  const days: Dayjs[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
}

export function weekdayLabels(locale = 'en'): string[] {
  if (locale.toLowerCase().startsWith('vi')) {
    return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  }
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
}
