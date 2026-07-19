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
          'flex min-h-9 w-full flex-row items-stretch overflow-hidden rounded-xl border bg-transparent',
          isInvalid ? 'border-danger' : 'border-default',
          disabled ? 'opacity-50' : '',
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
          className="min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-default-400 focus-visible:ring-0"
        />
        {allowClear && hasValue && !disabled ? (
          <button
            type="button"
            aria-label={clearAriaLabel}
            className="flex shrink-0 cursor-pointer items-center border-l border-default px-2 text-default-500 outline-none hover:bg-default-100"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onClear?.()}
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        ) : null}
        <Popover.Trigger
          aria-label={triggerAriaLabel}
          aria-disabled={disabled || undefined}
          className={[
            'flex shrink-0 items-center border-l border-default px-3 text-default-600 outline-none',
            disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-default-100',
          ].join(' ')}
        >
          <Icon className="size-4" strokeWidth={2} />
        </Popover.Trigger>
      </div>
      <Popover.Content className="p-0" placement="bottom start">
        <Popover.Dialog>{children}</Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
