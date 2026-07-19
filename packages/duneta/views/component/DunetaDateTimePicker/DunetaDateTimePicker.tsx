import { useEffect, useRef, useState } from 'react';
import { CalendarPanel, TimeFieldPanel } from '../_shared/date/calendar-panels';
import {
  dayjs,
  dayjsValueKey,
  formatCommitted,
  isWithinRange,
  parseCommitted,
  sanitizeDateTyping,
  toBoundDayjs,
  withDate,
  withTime,
  type Dayjs,
} from '../_shared/date/dayjs-date';
import { PickerShell } from '../_shared/date/picker-shell';
import type { DunetaDateTimePickerProps } from './types';

const DEFAULT_FORMAT = 'DD/MM/YYYY HH:mm';

export function DunetaDateTimePicker({
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
  hourCycle = 24,
  'aria-label': ariaLabel = 'Date and time',
}: DunetaDateTimePickerProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<Dayjs | null>(defaultValue);
  const committed = isControlled ? (value ?? null) : inner;
  const valueKey = dayjsValueKey(committed, 'YYYY-MM-DD HH:mm');
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => formatCommitted(committed, format));
  const [open, setOpen] = useState(false);

  const draftBase = committed?.isValid()
    ? committed
    : dayjs().hour(0).minute(0).second(0).millisecond(0);

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

    const parsed = parseCommitted(trimmed, format, 'minute');
    if (!parsed || !isWithinRange(parsed, minDate, maxDate, 'minute')) {
      restorePrevious();
      return;
    }

    setCommitted(parsed);
  }

  function handleCalendarChange(next: Dayjs) {
    const merged = withDate(draftBase, next);
    if (!isWithinRange(merged, minDate, maxDate, 'minute')) {
      restorePrevious();
      return;
    }
    setCommitted(merged);
  }

  function handleTimeChange({ hour, minute }: { hour: number; minute: number }) {
    const merged = withTime(draftBase, hour, minute);
    if (!isWithinRange(merged, minDate, maxDate, 'minute')) {
      restorePrevious();
      return;
    }
    setCommitted(merged);
  }

  return (
    <PickerShell
      ariaLabel={ariaLabel}
      triggerAriaLabel={`${ariaLabel} — open date and time picker`}
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
      <div className="flex flex-col gap-1">
        <CalendarPanel
          ariaLabel={`${ariaLabel} date`}
          value={committed?.isValid() ? committed : null}
          onChange={handleCalendarChange}
          minDate={toBoundDayjs(minDate)}
          maxDate={toBoundDayjs(maxDate)}
          locale={locale}
        />
        <TimeFieldPanel
          ariaLabel={`${ariaLabel} time`}
          value={committed?.isValid() ? committed : draftBase}
          onChange={handleTimeChange}
          hourCycle={hourCycle}
        />
      </div>
    </PickerShell>
  );
}
