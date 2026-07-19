import { useEffect, useRef, useState } from 'react';
import { CalendarPanel, PickerFooterActions } from '../_shared/date/calendar-panels';
import {
  dayjs,
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
const VALUE_KEY_FORMAT = 'YYYY-MM-DD';

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
  const valueKey = dayjsValueKey(committed, VALUE_KEY_FORMAT);
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => formatCommitted(committed, format));
  const [open, setOpen] = useState(false);
  const [panelValue, setPanelValue] = useState<Dayjs | null>(null);
  const panelValueRef = useRef<Dayjs | null>(null);

  useEffect(() => {
    if (focusedRef.current || open) return;
    setDraft(formatCommitted(committed, format));
  }, [valueKey, format, committed, open]);

  function setCommitted(next: Dayjs | null) {
    if (!isControlled) setInner(next);
    onChange?.(next);
    setDraft(formatCommitted(next, format));
  }

  function updatePanel(next: Dayjs | null) {
    panelValueRef.current = next;
    setPanelValue(next);
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

  function handleOpenChange(next: boolean) {
    if (next) {
      updatePanel(committed?.isValid() ? committed : dayjs().startOf('day'));
      setOpen(true);
      return;
    }

    setOpen(false);
    const picked = panelValueRef.current;
    if (!picked?.isValid() || !isWithinRange(picked, minDate, maxDate, 'day')) return;
    if (dayjsValueKey(picked, VALUE_KEY_FORMAT) === valueKey) return;
    setCommitted(picked.startOf('day'));
  }

  function handleCalendarChange(next: Dayjs) {
    if (!isWithinRange(next, minDate, maxDate, 'day')) return;
    updatePanel(next.startOf('day'));
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
      onOpenChange={handleOpenChange}
      disabled={disabled}
      isInvalid={isInvalid}
      allowClear={allowClear}
      hasValue={Boolean(committed?.isValid())}
      onClear={() => setCommitted(null)}
      locale={locale}
      className={className}
      icon="calendar"
    >
      <div className="flex flex-col">
        <CalendarPanel
          ariaLabel={ariaLabel}
          value={panelValue?.isValid() ? panelValue : null}
          onChange={handleCalendarChange}
          minDate={toBoundDayjs(minDate)}
          maxDate={toBoundDayjs(maxDate)}
          locale={locale}
        />
        <PickerFooterActions
          locale={locale}
          onToday={() => handleCalendarChange(dayjs().startOf('day'))}
        />
      </div>
    </PickerShell>
  );
}
