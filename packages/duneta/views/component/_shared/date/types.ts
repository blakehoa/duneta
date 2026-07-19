import type { Dayjs } from './dayjs-date';

export type DunetaDateBound = Dayjs | string;

export type DunetaPickerBaseProps = {
  format?: string;
  placeholder?: string;
  minDate?: DunetaDateBound;
  maxDate?: DunetaDateBound;
  disabled?: boolean;
  allowClear?: boolean;
  isInvalid?: boolean;
  className?: string;
  locale?: string;
  'aria-label'?: string;
};
