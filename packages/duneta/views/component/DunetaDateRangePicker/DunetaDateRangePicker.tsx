import { useEffect, useRef, useState } from 'react';
import { PickerFooterActions, RangeCalendarPanel } from '../_shared/date/calendar-panels';
import {
  dayjs,
  formatRangeCommitted,
  isWithinRange,
  parseRangeCommitted,
  rangeValueKey,
  sanitizeDateTyping,
  toBoundDayjs,
} from '../_shared/date/dayjs-date';
import { PickerShell } from '../_shared/date/picker-shell';
import type { DunetaDateRange, DunetaDateRangePickerProps } from './types';

const DEFAULT_FORMAT = 'DD/MM/YYYY';
const DEFAULT_SEPARATOR = ' ~ ';
const VALUE_KEY_FORMAT = 'YYYY-MM-DD';

export function DunetaDateRangePicker({
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
  separator = DEFAULT_SEPARATOR,
  'aria-label': ariaLabel = 'Date range',
}: DunetaDateRangePickerProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<DunetaDateRange | null>(defaultValue);
  const committed = isControlled ? (value ?? null) : inner;
  const valueKey = rangeValueKey(committed, VALUE_KEY_FORMAT);
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => formatRangeCommitted(committed, format, separator));
  const [open, setOpen] = useState(false);
  const [panelValue, setPanelValue] = useState<DunetaDateRange | null>(null);
  const panelValueRef = useRef<DunetaDateRange | null>(null);

  useEffect(() => {
    if (focusedRef.current || open) return;
    setDraft(formatRangeCommitted(committed, format, separator));
  }, [valueKey, format, separator, committed, open]);

  function setCommitted(next: DunetaDateRange | null) {
    if (!isControlled) setInner(next);
    onChange?.(next);
    setDraft(formatRangeCommitted(next, format, separator));
  }

  function updatePanel(next: DunetaDateRange | null) {
    panelValueRef.current = next;
    setPanelValue(next);
  }

  function restorePrevious() {
    setDraft(formatRangeCommitted(committed, format, separator));
  }

  function commitFromString(raw: string) {
    const trimmed = sanitizeDateTyping(raw).trim();
    if (!trimmed) {
      setCommitted(null);
      return;
    }

    const parsed = parseRangeCommitted(trimmed, format, separator.trim());
    if (
      !parsed ||
      !isWithinRange(parsed[0], minDate, maxDate, 'day') ||
      !isWithinRange(parsed[1], minDate, maxDate, 'day')
    ) {
      restorePrevious();
      return;
    }

    setCommitted(parsed);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      updatePanel(committed);
      setOpen(true);
      return;
    }

    setOpen(false);
    const picked = panelValueRef.current;
    if (
      !picked?.[0]?.isValid() ||
      !picked[1]?.isValid() ||
      !isWithinRange(picked[0], minDate, maxDate, 'day') ||
      !isWithinRange(picked[1], minDate, maxDate, 'day')
    ) {
      return;
    }
    if (rangeValueKey(picked, VALUE_KEY_FORMAT) === valueKey) return;
    setCommitted(picked);
  }

  function handleRangeChange(next: DunetaDateRange) {
    if (
      !isWithinRange(next[0], minDate, maxDate, 'day') ||
      !isWithinRange(next[1], minDate, maxDate, 'day')
    ) {
      return;
    }
    updatePanel(next);
  }

  function selectTodayRange() {
    const today = dayjs().startOf('day');
    handleRangeChange([today, today]);
  }

  return (
    <PickerShell
      ariaLabel={ariaLabel}
      triggerAriaLabel={`${ariaLabel} — open calendar`}
      placeholder={placeholder ?? `${format}${separator}${format}`}
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
      hasValue={Boolean(committed?.[0]?.isValid() && committed[1]?.isValid())}
      onClear={() => setCommitted(null)}
      locale={locale}
      className={className}
      icon="calendar"
    >
      <div className="flex flex-col">
        <RangeCalendarPanel
          ariaLabel={ariaLabel}
          value={panelValue}
          onChange={handleRangeChange}
          minDate={toBoundDayjs(minDate)}
          maxDate={toBoundDayjs(maxDate)}
          locale={locale}
        />
        <PickerFooterActions locale={locale} onToday={selectTodayRange} />
      </div>
    </PickerShell>
  );
}
