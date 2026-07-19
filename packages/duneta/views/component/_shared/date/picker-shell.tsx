import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { Popover } from '@heroui/react';

export type PickerShellProps = {
  ariaLabel: string;
  triggerAriaLabel: string;
  clearAriaLabel?: string;
  placeholder: string;
  text: string;
  onTextChange: (next: string) => void;
  onCommitText: (raw: string) => void;
  onFocusChange?: (focused: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  isInvalid?: boolean;
  allowClear?: boolean;
  hasValue?: boolean;
  onClear?: () => void;
  locale?: string;
  className?: string;
  icon?: 'calendar' | 'clock';
  children: ReactNode;
};

export function PickerShell({
  ariaLabel,
  triggerAriaLabel,
  clearAriaLabel = 'Clear',
  placeholder,
  text,
  onTextChange,
  onCommitText,
  onFocusChange,
  open,
  onOpenChange,
  disabled,
  isInvalid,
  allowClear,
  hasValue,
  onClear,
  className,
  icon = 'calendar',
  children,
}: PickerShellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(false);
  const openRef = useRef(open);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    openRef.current = open;
  }

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  function handleOpenChange(next: boolean) {
    openRef.current = next;
    onOpenChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCommitText(event.currentTarget.value);
    }
  }

  const Icon = icon === 'clock' ? Clock : CalendarIcon;

  return (
    <Popover isOpen={open} onOpenChange={handleOpenChange}>
      <div
        className={[
          'flex min-h-[2.85rem] w-full flex-row items-stretch overflow-hidden border',
          'rounded-[var(--field-radius)] bg-[var(--field-background)] text-[var(--field-foreground)]',
          'focus-within:outline focus-within:outline-2 focus-within:outline-offset-[var(--ring-offset-width)]',
          isInvalid
            ? 'border-[var(--danger)] focus-within:outline-[var(--danger)]'
            : 'border-[var(--field-border)] focus-within:outline-[var(--focus)]',
          disabled ? 'opacity-[var(--disabled-opacity)]' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={inputRef}
          type="text"
          aria-label={ariaLabel}
          aria-invalid={isInvalid || undefined}
          disabled={disabled}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            focusedRef.current = true;
            onFocusChange?.(true);
          }}
          onBlur={() => {
            focusedRef.current = false;
            onFocusChange?.(false);
            window.setTimeout(() => {
              if (!focusedRef.current && !openRef.current) {
                onCommitText(inputRef.current?.value ?? '');
              }
            }, 0);
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-none border-0 bg-transparent px-[0.85rem] py-[0.7rem] font-[inherit] text-[inherit] outline-none ring-0 placeholder:text-[var(--field-placeholder)] focus-visible:ring-0"
        />
        {allowClear && hasValue && !disabled ? (
          <div className="flex shrink-0 items-center pr-1">
            <button
              type="button"
              aria-label={clearAriaLabel}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--field-foreground)]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onClear?.()}
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        ) : null}
        <Popover.Trigger
          aria-label={triggerAriaLabel}
          aria-disabled={disabled || undefined}
          className={[
            'flex shrink-0 items-center border-l border-[var(--border)] px-3 text-[var(--muted)] outline-none',
            disabled ? 'pointer-events-none cursor-not-allowed opacity-[var(--disabled-opacity)]' : 'cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--field-foreground)]',
          ].join(' ')}
        >
          <Icon className="size-4" strokeWidth={2} />
        </Popover.Trigger>
      </div>
      <Popover.Content className="p-0" placement="bottom end">
        <Popover.Dialog>{children}</Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
