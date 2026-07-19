import { useEffect, useRef, useState } from 'react';
import {
  CalendarPanel,
  PickerFooterActions,
  TimeFieldPanel,
} from '../_shared/date/calendar-panels';
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
const VALUE_KEY_FORMAT = 'YYYY-MM-DD HH:mm';

function emptyBase() {
  return dayjs().hour(0).minute(0).second(0).millisecond(0);
}

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
    if (!parsed || !isWithinRange(parsed, minDate, maxDate, 'minute')) {
      restorePrevious();
      return;
    }

    setCommitted(parsed);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      const seed = committed?.isValid() ? committed : emptyBase();
      updatePanel(seed);
      setOpen(true);
      return;
    }

    setOpen(false);
    const picked = panelValueRef.current;
    if (!picked?.isValid() || !isWithinRange(picked, minDate, maxDate, 'minute')) {
      return;
    }
    if (dayjsValueKey(picked, VALUE_KEY_FORMAT) === valueKey) return;
    setCommitted(picked);
  }

  const panelBase =
    panelValue?.isValid() ? panelValue : committed?.isValid() ? committed : emptyBase();

  function handleCalendarChange(next: Dayjs) {
    const merged = withDate(panelBase, next);
    if (!isWithinRange(merged, minDate, maxDate, 'minute')) return;
    updatePanel(merged);
  }

  function handleTimeChange({ hour, minute }: { hour: number; minute: number }) {
    const merged = withTime(panelBase, hour, minute);
    if (!isWithinRange(merged, minDate, maxDate, 'minute')) return;
    updatePanel(merged);
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
        <div className="relative flex flex-row">
          <CalendarPanel
            ariaLabel={`${ariaLabel} date`}
            value={panelValue?.isValid() ? panelValue : null}
            onChange={handleCalendarChange}
            minDate={toBoundDayjs(minDate)}
            maxDate={toBoundDayjs(maxDate)}
            locale={locale}
          />
          {/* Calendar defines the popover height; the time panel is pinned to it. */}
          <div className={hourCycle === 12 ? 'w-60 shrink-0' : 'w-40 shrink-0'}>
            <div
              className={[
                'absolute inset-y-0 right-0',
                hourCycle === 12 ? 'w-60' : 'w-40',
              ].join(' ')}
            >
              <TimeFieldPanel
                ariaLabel={`${ariaLabel} time`}
                value={panelBase}
                onChange={handleTimeChange}
                hourCycle={hourCycle}
              />
            </div>
          </div>
        </div>
        <PickerFooterActions
          locale={locale}
          onToday={() => handleCalendarChange(dayjs().startOf('day'))}
          onNow={() => {
            const now = dayjs();
            handleTimeChange({ hour: now.hour(), minute: now.minute() });
          }}
        />
      </div>
    </PickerShell>
  );
}
