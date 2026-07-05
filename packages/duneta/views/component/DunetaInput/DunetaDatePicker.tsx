import dayjs, { type ConfigType } from 'dayjs';
import { DunetaInput } from './DunetaInput';
import type { DunetaInputProps } from './types';

// Native date input normalized with dayjs.

export type DunetaDatePickerProps = Omit<DunetaInputProps, 'type' | 'value' | 'defaultValue'> & {
  value?: ConfigType | null;
  defaultValue?: ConfigType | null;
};

function toDateInputValue(value: ConfigType | null | undefined): string | undefined {
  if (value == null) return undefined;
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : '';
}

export function DunetaDatePicker({ value, defaultValue, ...props }: DunetaDatePickerProps) {
  return <DunetaInput {...props} type="date" value={toDateInputValue(value)} defaultValue={toDateInputValue(defaultValue)} />;
}
