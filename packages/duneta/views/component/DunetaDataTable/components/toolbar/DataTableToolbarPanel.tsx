
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../../../../core/cn.js';
import { DunetaPopover } from '../../../DunetaPopover';
import { DataTableToolbarPanelApplyFooter } from './DataTableToolbarPanelApplyFooter';

type DataTableToolbarPanelProps = {
  trigger: ReactNode;
  title: string;
  titleExtra?: ReactNode;
  children: ReactNode;
  /** When set, renders an Apply footer that calls this then closes the panel. */
  onApply?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  widthClassName?: string;
};

export function DataTableToolbarPanel({
  trigger,
  title,
  titleExtra,
  children,
  onApply,
  open: controlledOpen,
  onOpenChange,
  widthClassName = 'w-80',
}: DataTableToolbarPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  };

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  return (
    <DunetaPopover isOpen={open} onOpenChange={setOpen}>
      <DunetaPopover.Trigger>{trigger}</DunetaPopover.Trigger>
      <DunetaPopover.Content className={cn(widthClassName, 'p-0')}>
        <DunetaPopover.Dialog>
          <div className="flex flex-col">
            <header
              className={cn(
                'border-b border-border px-3 py-3',
                titleExtra != null &&
                  'flex items-center justify-between gap-3',
              )}
            >
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {titleExtra}
            </header>

            {children}

            {onApply ? (
              <DataTableToolbarPanelApplyFooter onApply={handleApply} />
            ) : null}
          </div>
        </DunetaPopover.Dialog>
      </DunetaPopover.Content>
    </DunetaPopover>
  );
}
