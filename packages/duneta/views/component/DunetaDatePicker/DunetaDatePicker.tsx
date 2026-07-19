import { useEffect, useRef, useState } from 'react';
import { CalendarPanel } from '../_shared/date/calendar-panels';
import {
  dayjsValueKey,
  formatCommitted,
  isWithinRange,
  parseCommitted,
  sanitizeDateTyping,
  toBoundDayjs,
  type Dayjs,
} from '../_shared/date/dayjs-date';
import { PickerShell } from '../_shared/date/picker-shell';
import type { DunetaDatePickerProps } from './types';

const DEFAULT_FORMAT = 'DD/MM/YYYY';

export function DunetaDatePicker({
  value,
  defaultValue = null,
  onChange,
  format = DEFAULT_FORMAT,
  placeholder,
  minDate,
  maxDate,
  disabled,
  allowClear = true,
  isInvalid,
  className,
  locale = 'vi-VN',
  'aria-label': ariaLabel = 'Date',
}: DunetaDatePickerProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<Dayjs | null>(defaultValue);
  const committed = isControlled ? (value ?? null) : inner;
  const valueKey = dayjsValueKey(committed, 'YYYY-MM-DD');
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => formatCommitted(committed, format));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (focusedRef.current) return;
    setDraft(formatCommitted(committed, format));
  }, [valueKey, format, committed]);

  function setCommitted(next: Dayjs | null) {
    if (!isControlled) setInner(next);
    onChange?.(next);
    setDraft(formatCommitted(next, format));
  }

  function restorePrevious() {
    setDraft(formatCommitted(committed, format));
  }

  function commitFromString(raw: string) {
    const trimmed = sanitizeDateTyping(raw).trim();
    if (!trimmed) {
      setCommitted(null);
      return;
    }

    const parsed = parseCommitted(trimmed, format, 'day');
    if (!parsed || !isWithinRange(parsed, minDate, maxDate, 'day')) {
      restorePrevious();
      return;
    }

    setCommitted(parsed);
  }

  function handleCalendarChange(next: Dayjs) {
    if (!isWithinRange(next, minDate, maxDate, 'day')) {
      restorePrevious();
      return;
    }
    setCommitted(next.startOf('day'));
  }

  return (
    <PickerShell
      ariaLabel={ariaLabel}
      triggerAriaLabel={`${ariaLabel} — open calendar`}
      placeholder={placeholder ?? format}
      text={draft}
      onTextChange={(next) => setDraft(sanitizeDateTyping(next))}
      onCommitText={commitFromString}
      onFocusChange={(focused) => {
        focusedRef.current = focused;
      }}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      isInvalid={isInvalid}
      allowClear={allowClear}
      hasValue={Boolean(committed?.isValid())}
      onClear={() => setCommitted(null)}
      locale={locale}
      className={className}
      icon="calendar"
    >
      <CalendarPanel
        ariaLabel={ariaLabel}
        value={committed?.isValid() ? committed : null}
        onChange={handleCalendarChange}
        minDate={toBoundDayjs(minDate)}
        maxDate={toBoundDayjs(maxDate)}
        locale={locale}
      />
    </PickerShell>
  );
}
