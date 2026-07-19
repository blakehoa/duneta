import type { Dayjs } from '../_shared/date/dayjs-date';
import type { DunetaPickerBaseProps } from '../_shared/date/types';

export type DunetaDateTimePickerProps = DunetaPickerBaseProps & {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  hourCycle?: 12 | 24;
};
