import { useEffect, useRef, useState } from 'react';
import { PickerFooterActions, TimeFieldPanel } from '../_shared/date/calendar-panels';
import {
  dayjs,
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
const VALUE_KEY_FORMAT = 'HH:mm';

function emptyBase() {
  return dayjs().hour(0).minute(0).second(0).millisecond(0);
}

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

    const parsed = parseCommitted(trimmed, format, 'minute');
    if (!parsed) {
      restorePrevious();
      return;
    }

    setCommitted(withTime(committed, parsed.hour(), parsed.minute()));
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      updatePanel(committed?.isValid() ? committed : emptyBase());
      setOpen(true);
      return;
    }

    setOpen(false);
    const picked = panelValueRef.current;
    if (!picked?.isValid()) return;
    if (dayjsValueKey(picked, VALUE_KEY_FORMAT) === valueKey) return;
    setCommitted(picked);
  }

  const panelBase =
    panelValue?.isValid() ? panelValue : committed?.isValid() ? committed : emptyBase();

  function handleTimeChange({ hour, minute }: { hour: number; minute: number }) {
    updatePanel(withTime(panelBase, hour, minute));
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
      onOpenChange={handleOpenChange}
      disabled={disabled}
      isInvalid={isInvalid}
      allowClear={allowClear}
      hasValue={Boolean(committed?.isValid())}
      onClear={() => setCommitted(null)}
      locale={locale}
      className={className}
      icon="clock"
    >
      <div className="flex h-56 flex-col">
        <div className="min-h-0 flex-1">
          <TimeFieldPanel
            ariaLabel={ariaLabel}
            value={panelBase}
            onChange={handleTimeChange}
            hourCycle={hourCycle}
          />
        </div>
        <PickerFooterActions
          locale={locale}
          onNow={() => {
            const now = dayjs();
            handleTimeChange({ hour: now.hour(), minute: now.minute() });
          }}
        />
      </div>
    </PickerShell>
  );
}
