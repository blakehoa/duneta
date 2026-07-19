import { useEffect, useRef, useState } from 'react';
import { TimeFieldPanel } from '../_shared/date/calendar-panels';
import {
  dayjsValueKey,
  formatCommitted,
  parseCommitted,
  sanitizeDateTyping,
  withTime,
  type Dayjs,
} from '../_shared/date/dayjs-date';
import { PickerShell } from '../_shared/date/picker-shell';
import type { DunetaTimePickerProps } from './types';

const DEFAULT_FORMAT = 'HH:mm';

export function DunetaTimePicker({
  value,
  defaultValue = null,
  onChange,
  format = DEFAULT_FORMAT,
  placeholder,
  disabled,
  allowClear = true,
  isInvalid,
  className,
  locale = 'vi-VN',
  hourCycle = 24,
  'aria-label': ariaLabel = 'Time',
}: DunetaTimePickerProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<Dayjs | null>(defaultValue);
  const committed = isControlled ? (value ?? null) : inner;
  const valueKey = dayjsValueKey(committed, 'HH:mm:ss');
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

    const parsed = parseCommitted(trimmed, format, 'minute');
    if (!parsed) {
      restorePrevious();
      return;
    }

    setCommitted(withTime(committed, parsed.hour(), parsed.minute()));
  }

  return (
    <PickerShell
      ariaLabel={ariaLabel}
      triggerAriaLabel={`${ariaLabel} — open time picker`}
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
      icon="clock"
    >
      <TimeFieldPanel
        ariaLabel={ariaLabel}
        value={committed?.isValid() ? committed : null}
        onChange={({ hour, minute }) => setCommitted(withTime(committed, hour, minute))}
        hourCycle={hourCycle}
      />
    </PickerShell>
  );
}
