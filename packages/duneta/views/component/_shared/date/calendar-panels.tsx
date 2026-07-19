import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildMonthCells,
  dayjs,
  isWithinRange,
  weekdayLabels,
  type Dayjs,
} from './dayjs-date';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function MonthHeader({
  month,
  onPrev,
  onNext,
}: {
  month: Dayjs;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 px-1">
      <button
        type="button"
        aria-label="Previous month"
        className="inline-flex size-8 items-center justify-center rounded-lg text-default-600 outline-none hover:bg-default-100"
        onClick={onPrev}
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="text-sm font-medium">{month.format('MMMM YYYY')}</div>
      <button
        type="button"
        aria-label="Next month"
        className="inline-flex size-8 items-center justify-center rounded-lg text-default-600 outline-none hover:bg-default-100"
        onClick={onNext}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export function CalendarPanel({
  ariaLabel,
  value,
  onChange,
  minDate,
  maxDate,
  locale = 'en',
}: {
  ariaLabel: string;
  value: Dayjs | null;
  onChange: (next: Dayjs) => void;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  locale?: string;
}) {
  const [month, setMonth] = useState(() => (value?.isValid() ? value : dayjs()).startOf('month'));
  const cells = useMemo(() => buildMonthCells(month), [month]);
  const labels = useMemo(() => weekdayLabels(locale), [locale]);

  useEffect(() => {
    if (value?.isValid()) setMonth(value.startOf('month'));
  }, [value]);

  return (
    <div aria-label={ariaLabel} className="w-[280px] p-3">
      <MonthHeader
        month={month}
        onPrev={() => setMonth((current) => current.subtract(1, 'month'))}
        onNext={() => setMonth((current) => current.add(1, 'month'))}
      />
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-default-500">
        {labels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day) => {
          const inMonth = day.month() === month.month();
          const selected = Boolean(value?.isValid() && day.isSame(value, 'day'));
          const today = day.isSame(dayjs(), 'day');
          const disabled = !isWithinRange(day, minDate, maxDate, 'day');
          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              className={[
                'inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none',
                !inMonth ? 'text-default-300' : '',
                today && !selected ? 'ring-1 ring-default-300' : '',
                selected ? 'bg-primary text-primary-foreground' : 'hover:bg-default-100',
                disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(day.startOf('day'))}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RangeCalendarPanel({
  ariaLabel,
  value,
  onChange,
  minDate,
  maxDate,
  locale = 'en',
}: {
  ariaLabel: string;
  value: [Dayjs, Dayjs] | null;
  onChange: (next: [Dayjs, Dayjs]) => void;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  locale?: string;
}) {
  const [month, setMonth] = useState(() =>
    (value?.[0]?.isValid() ? value[0] : dayjs()).startOf('month'),
  );
  const [anchor, setAnchor] = useState<Dayjs | null>(null);
  const cells = useMemo(() => buildMonthCells(month), [month]);
  const labels = useMemo(() => weekdayLabels(locale), [locale]);

  useEffect(() => {
    if (value?.[0]?.isValid()) setMonth(value[0].startOf('month'));
  }, [value]);

  function handlePick(day: Dayjs) {
    const next = day.startOf('day');
    if (!anchor) {
      setAnchor(next);
      return;
    }

    const start = anchor.isBefore(next, 'day') ? anchor : next;
    const end = anchor.isBefore(next, 'day') ? next : anchor;
    setAnchor(null);
    onChange([start, end]);
  }

  const start = value?.[0]?.isValid() ? value[0] : null;
  const end = value?.[1]?.isValid() ? value[1] : null;

  return (
    <div aria-label={ariaLabel} className="w-[280px] p-3">
      <MonthHeader
        month={month}
        onPrev={() => setMonth((current) => current.subtract(1, 'month'))}
        onNext={() => setMonth((current) => current.add(1, 'month'))}
      />
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-default-500">
        {labels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day) => {
          const inMonth = day.month() === month.month();
          const isStart = Boolean(start && day.isSame(start, 'day'));
          const isEnd = Boolean(end && day.isSame(end, 'day'));
          const inRange =
            Boolean(start && end) &&
            day.isAfter(start!, 'day') &&
            day.isBefore(end!, 'day');
          const isAnchor = Boolean(anchor && day.isSame(anchor, 'day'));
          const selected = isStart || isEnd || isAnchor;
          const disabled = !isWithinRange(day, minDate, maxDate, 'day');
          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              className={[
                'inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none',
                !inMonth ? 'text-default-300' : '',
                inRange ? 'bg-primary/15' : '',
                selected ? 'bg-primary text-primary-foreground' : 'hover:bg-default-100',
                disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handlePick(day)}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeWheel({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: number[];
  value: number;
  onChange: (next: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'center' });
  }, [value]);

  return (
    <div className="flex min-w-14 flex-col items-center gap-1">
      <span className="text-[11px] text-default-500">{label}</span>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="h-36 w-full overflow-y-auto rounded-lg border border-default p-1"
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={active}
              data-active={active ? 'true' : undefined}
              className={[
                'flex w-full items-center justify-center rounded-md py-1.5 text-sm outline-none',
                active ? 'bg-primary text-primary-foreground' : 'hover:bg-default-100',
              ].join(' ')}
              onClick={() => onChange(option)}
            >
              {pad(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function to12Hour(hour24: number) {
  const display = hour24 % 12;
  return display === 0 ? 12 : display;
}

function to24Hour(display: number, isPm: boolean) {
  if (display === 12) return isPm ? 12 : 0;
  return isPm ? display + 12 : display;
}

export function TimeFieldPanel({
  ariaLabel,
  value,
  onChange,
  hourCycle = 24,
}: {
  ariaLabel: string;
  value: Dayjs | null;
  onChange: (next: { hour: number; minute: number }) => void;
  hourCycle?: 12 | 24;
}) {
  const hour = value?.isValid() ? value.hour() : 0;
  const minute = value?.isValid() ? value.minute() : 0;
  const isPm = hour >= 12;
  const hours =
    hourCycle === 12
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : Array.from({ length: 24 }, (_, index) => index);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  return (
    <div aria-label={ariaLabel} className="flex items-end justify-center gap-2 p-3">
      <TimeWheel
        label="H"
        options={hours}
        value={hourCycle === 12 ? to12Hour(hour) : hour}
        onChange={(next) => {
          onChange({
            hour: hourCycle === 12 ? to24Hour(next, isPm) : next,
            minute,
          });
        }}
      />
      <span className="pb-16 text-lg font-semibold text-default-500">:</span>
      <TimeWheel
        label="M"
        options={minutes}
        value={minute}
        onChange={(next) => onChange({ hour, minute: next })}
      />
      {hourCycle === 12 ? (
        <div className="flex min-w-14 flex-col items-center gap-1">
          <span className="text-[11px] text-default-500">AM/PM</span>
          <div className="flex h-36 w-full flex-col gap-1 rounded-lg border border-default p-1">
            {(['AM', 'PM'] as const).map((period) => {
              const active = period === 'PM' ? isPm : !isPm;
              return (
                <button
                  key={period}
                  type="button"
                  className={[
                    'flex flex-1 items-center justify-center rounded-md text-sm outline-none',
                    active ? 'bg-primary text-primary-foreground' : 'hover:bg-default-100',
                  ].join(' ')}
                  onClick={() =>
                    onChange({ hour: to24Hour(to12Hour(hour), period === 'PM'), minute })
                  }
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
