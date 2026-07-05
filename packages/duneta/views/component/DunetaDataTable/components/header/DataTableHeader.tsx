
import { useSortable } from '@dnd-kit/sortable';
import { Table } from '@heroui/react';
import {
  flexRender,
  type Header,
  type Table as ReactTable,
} from '@tanstack/react-table';
import {
  useCallback,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../../../../core/cn.js';
import {
  getColumnPinPresentation,
  isColumnDragEnabled,
  isColumnDraggable,
  isColumnPinned,
  isColumnResizable,
  resolveHeaderColumnWidthProps,
  type ColumnDragConfig,
  type ColumnResizeConfig,
  type ResolvedColumnWidthProps,
} from '../../core/columns';
import { isSelectionColumnId } from '../../core/row-selection';
import { SELECTION_COLUMN_CLASS, TABLE_STICKY_HEADER_CELL_CLASS } from '../../constants';
import { DunetaTable } from '../../../DunetaTable';
import { useColumnDragState } from './column-drag-context';
import {
  ColumnDragHandle,
  ColumnPinHandle,
  ColumnResizerHandle,
} from './column-handles';

type DataTableHeaderProps<TData> = {
  headers: Array<Header<TData, unknown>>;
  table: ReactTable<TData>;
  columnDrag: ColumnDragConfig;
  columnResize: ColumnResizeConfig;
  resizeEnabled: boolean;
  pinEnabled: boolean;
};

type HeaderColumnShellProps = {
  allowsSorting: boolean;
  columnRef?: Ref<HTMLTableCellElement>;
  id: string;
  isRowHeader: boolean;
  resizeEnabled: boolean;
  resizable: boolean;
  widthProps?: ResolvedColumnWidthProps;
  pinClassName?: string;
  style?: React.CSSProperties;
  label: ReactNode;
  leading?: ReactNode;
  dropIndicators?: ReactNode;
};

function SelectionHeaderColumn({
  id,
  pinClassName,
  style,
  label,
  widthProps,
}: {
  id: string;
  pinClassName?: string;
  style?: React.CSSProperties;
  label: ReactNode;
  widthProps?: ResolvedColumnWidthProps;
}) {
  return (
    <DunetaTable.Column
      className={cn(
        TABLE_STICKY_HEADER_CELL_CLASS,
        'bg-surface-secondary',
        SELECTION_COLUMN_CLASS,
        pinClassName,
      )}
      id={id}
      style={style}
      {...widthProps}
    >
      {label}
    </DunetaTable.Column>
  );
}

function ColumnDropIndicator({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-1 bottom-1 z-20 w-1 rounded-full bg-primary shadow-sm',
        side === 'left' ? '-left-0.5' : '-right-0.5',
      )}
    />
  );
}

function HeaderColumnShell({
  allowsSorting,
  columnRef,
  id,
  isRowHeader,
  resizeEnabled,
  resizable,
  widthProps,
  pinClassName,
  style,
  label,
  leading,
  dropIndicators,
}: HeaderColumnShellProps) {
  return (
    <DunetaTable.Column
      ref={columnRef}
      allowsSorting={allowsSorting}
      className={cn(
        TABLE_STICKY_HEADER_CELL_CLASS,
        'bg-surface-secondary',
        pinClassName,
        resizable &&
          'group/column relative data-[resizing]:!bg-primary/10 data-[resizing]:text-foreground dark:data-[resizing]:!bg-primary/20',
      )}
      id={id}
      isRowHeader={isRowHeader}
      style={style}
      {...widthProps}
    >
      {({ sortDirection, isResizing }) => (
        <>
          <div
            className={cn(
              'relative flex min-w-0 items-center gap-1.5 rounded-sm px-0.5',
              !isResizing && 'transition-colors',
            )}
          >
            {dropIndicators}
            {leading}
            {allowsSorting ? (
              <Table.SortableColumnHeader
                sortDirection={sortDirection}
                className={cn(
                  'min-w-0 flex-1 truncate',
                  isResizing && 'pointer-events-none select-none',
                )}
              >
                {label}
              </Table.SortableColumnHeader>
            ) : (
              <span
                className={cn(
                  'min-w-0 flex-1 truncate',
                  isResizing && 'pointer-events-none select-none',
                )}
              >
                {label}
              </span>
            )}
          </div>
          {resizeEnabled && resizable ? (
            <ColumnResizerHandle columnId={id} isResizing={isResizing} />
          ) : null}
        </>
      )}
    </DunetaTable.Column>
  );
}

function SortableHeaderColumn({
  columnId,
  allowsSorting,
  draggable,
  id,
  isRowHeader,
  resizeEnabled,
  resizable,
  widthProps,
  pinClassName,
  columnStyle,
  label,
}: {
  columnId: string;
  allowsSorting: boolean;
  draggable: boolean;
  id: string;
  isRowHeader: boolean;
  resizeEnabled: boolean;
  resizable: boolean;
  widthProps: ResolvedColumnWidthProps;
  pinClassName?: string;
  columnStyle?: React.CSSProperties;
  label: ReactNode;
}) {
  const { activeId, overId, columnIds } = useColumnDragState();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useSortable({
      id: columnId,
      disabled: !draggable,
      animateLayoutChanges: () => false,
    });

  const columnRef = useCallback(
    (element: HTMLTableCellElement | null) => {
      setNodeRef(element);
    },
    [setNodeRef],
  );

  const stopPointerPropagation = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const isDropTarget =
    overId === columnId && activeId !== null && activeId !== columnId;
  const activeIndex = activeId ? columnIds.indexOf(activeId) : -1;
  const overIndex = columnIds.indexOf(columnId);

  return (
    <HeaderColumnShell
      allowsSorting={allowsSorting}
      columnRef={columnRef}
      dropIndicators={
        <>
          {isDropTarget && activeIndex > overIndex ? (
            <ColumnDropIndicator side="left" />
          ) : null}
          {isDropTarget && activeIndex < overIndex ? (
            <ColumnDropIndicator side="right" />
          ) : null}
        </>
      }
      id={id}
      isRowHeader={isRowHeader}
      label={label}
      leading={
        draggable ? (
          <ColumnDragHandle
            activatorRef={setActivatorNodeRef}
            attributes={attributes}
            columnId={columnId}
            isDragActive={activeId !== null}
            listeners={listeners}
            onPointerDown={stopPointerPropagation}
          />
        ) : null
      }
      resizeEnabled={resizeEnabled}
      resizable={resizable}
      pinClassName={pinClassName}
      style={{ ...columnStyle, opacity: isDragging ? 0.35 : undefined }}
      widthProps={widthProps}
    />
  );
}

export function DataTableHeader<TData>({
  headers,
  table,
  columnDrag,
  columnResize,
  resizeEnabled,
  pinEnabled,
}: DataTableHeaderProps<TData>) {
  const dragEnabled = isColumnDragEnabled(columnDrag);

  return (
    <DunetaTable.Header>
      {headers.map((header, index) => {
        const label = flexRender(
          header.column.columnDef.header,
          header.getContext(),
        );
        const columnId = header.column.id;
        const firstDataHeaderIndex = headers.findIndex(
          (item) => !isSelectionColumnId(item.column.id),
        );
        const isRowHeader = index === firstDataHeaderIndex;
        const allowsSorting = header.column.getCanSort();
        const widthProps = resolveHeaderColumnWidthProps(header, resizeEnabled);
        const resizable =
          !isSelectionColumnId(columnId) &&
          isColumnResizable(columnResize, columnId);
        const pinnedSide = header.column.getIsPinned();
        const draggable =
          dragEnabled &&
          isColumnDraggable(columnDrag, columnId, isColumnPinned(header.column));
        const pin = pinEnabled
          ? getColumnPinPresentation(header.column, table, 'header')
          : { className: '', style: {} };

        if (isSelectionColumnId(columnId)) {
          return (
            <SelectionHeaderColumn
              key={header.id}
              id={columnId}
              label={label}
              pinClassName={pin.className}
              style={pin.style}
              widthProps={widthProps}
            />
          );
        }

        if (draggable) {
          return (
            <SortableHeaderColumn
              key={header.id}
              allowsSorting={allowsSorting}
              columnId={columnId}
              columnStyle={pin.style}
              draggable
              id={columnId}
              isRowHeader={isRowHeader}
              label={label}
              pinClassName={pin.className}
              resizeEnabled={resizeEnabled}
              resizable={resizable}
              widthProps={widthProps}
            />
          );
        }

        return (
          <HeaderColumnShell
            key={header.id}
            allowsSorting={allowsSorting}
            id={columnId}
            isRowHeader={isRowHeader}
            label={label}
            leading={
              dragEnabled && pinnedSide && !isSelectionColumnId(columnId) ? (
                <ColumnPinHandle columnId={columnId} side={pinnedSide} />
              ) : null
            }
            pinClassName={pin.className}
            resizeEnabled={resizeEnabled}
            resizable={resizable}
            style={pin.style}
            widthProps={widthProps}
          />
        );
      })}
    </DunetaTable.Header>
  );
}
