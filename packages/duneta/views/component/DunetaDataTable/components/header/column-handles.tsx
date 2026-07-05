
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { GripVertical, Pin } from 'lucide-react';
import type { PointerEvent } from 'react';
import { cn } from '../../../../../core/cn.js';
import { DunetaTable } from '../../../DunetaTable';
import { DunetaTooltip } from '../../../DunetaTooltip';

const COLUMN_HANDLE_ICON_CLASS = 'size-3.5 shrink-0';
const COLUMN_HANDLE_ICON_STROKE = 2;

type ColumnDragHandleProps = {
  columnId: string;
  isDragActive: boolean;
  activatorRef: (node: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
};

export function ColumnDragHandle({
  columnId,
  isDragActive,
  activatorRef,
  attributes,
  listeners,
  onPointerDown,
}: ColumnDragHandleProps) {
  return (
    <DunetaTooltip closeDelay={0} delay={400} isDisabled={isDragActive}>
      <button
        type="button"
        ref={activatorRef}
        aria-label={`Drag ${columnId} column`}
        className={cn(
          'shrink-0 cursor-grab rounded p-0.5 text-muted',
          'hover:bg-default-100 hover:text-foreground active:cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
        onPointerDown={onPointerDown}
      >
        <GripVertical
          aria-hidden
          className={COLUMN_HANDLE_ICON_CLASS}
          strokeWidth={COLUMN_HANDLE_ICON_STROKE}
        />
      </button>
      <DunetaTooltip.Content offset={8} placement="top" showArrow>
        <DunetaTooltip.Arrow />
        Drag column
      </DunetaTooltip.Content>
    </DunetaTooltip>
  );
}

type ColumnPinHandleProps = {
  columnId: string;
  side: 'left' | 'right';
};

export function ColumnPinHandle({ columnId, side }: ColumnPinHandleProps) {
  return (
    <DunetaTooltip closeDelay={0} delay={400}>
      <span
        role="img"
        aria-label={`${columnId} column pinned ${side}`}
        className="shrink-0 rounded p-0.5 text-muted"
      >
        <Pin
          aria-hidden
          className={COLUMN_HANDLE_ICON_CLASS}
          strokeWidth={COLUMN_HANDLE_ICON_STROKE}
        />
      </span>
      <DunetaTooltip.Content offset={8} placement="top" showArrow>
        <DunetaTooltip.Arrow />
        Pinned column
      </DunetaTooltip.Content>
    </DunetaTooltip>
  );
}

type ColumnResizerHandleProps = {
  columnId: string;
  isResizing: boolean;
};

export function ColumnResizerHandle({
  columnId,
  isResizing,
}: ColumnResizerHandleProps) {
  return (
    <DunetaTooltip closeDelay={0} delay={400} isDisabled={isResizing}>
      <DunetaTooltip.Trigger
        aria-label={`Resize ${columnId} column`}
        className={cn(
          '!absolute !inset-y-0 !top-0 !bottom-0 !end-0 z-30 w-3 translate-x-1/2',
          'cursor-col-resize touch-none border-0 bg-transparent p-0 outline-none',
          'opacity-0 transition-opacity',
          isResizing && 'opacity-100',
          'group-hover/column:opacity-100',
          'hover:opacity-100',
          'data-[hovered]:opacity-100',
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:-translate-x-1/2 before:rounded-full before:bg-primary/45 before:transition-[width,background-color,box-shadow]',
          'group-hover/column:before:bg-primary/80',
          'hover:before:bg-primary',
          'data-[hovered]:before:bg-primary/90',
          isResizing && 'before:w-1 before:bg-primary before:shadow-md',
        )}
      >
        <DunetaTable.ColumnResizer
          aria-label={`Resize ${columnId} column`}
          className={cn(
            '!absolute !inset-0 !top-0 !bottom-0 !end-0 !h-auto !w-full',
            '!translate-x-0 !-translate-y-0 touch-none !bg-transparent',
          )}
        />
      </DunetaTooltip.Trigger>
      <DunetaTooltip.Content offset={8} placement="top" showArrow>
        <DunetaTooltip.Arrow />
        Resize column
      </DunetaTooltip.Content>
    </DunetaTooltip>
  );
}
