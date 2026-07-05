import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export { dayjs };

export function formatDate(value: string | Date | number, pattern = 'YYYY-MM-DD') {
  return dayjs(value).format(pattern);
}

export function formatDateTime(value: string | Date | number, pattern = 'YYYY-MM-DD HH:mm') {
  return dayjs(value).format(pattern);
}

export function fromNow(value: string | Date | number) {
  return dayjs(value).fromNow();
}
