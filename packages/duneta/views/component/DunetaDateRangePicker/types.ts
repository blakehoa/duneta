import type { Dayjs } from '../_shared/date/dayjs-date';
import type { DunetaPickerBaseProps } from '../_shared/date/types';

export type DunetaDateRange = [Dayjs, Dayjs];

export type DunetaDateRangePickerProps = DunetaPickerBaseProps & {
  value?: DunetaDateRange | null;
  defaultValue?: DunetaDateRange | null;
  onChange?: (value: DunetaDateRange | null) => void;
  separator?: string;
};
