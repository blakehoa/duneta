import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Checkbox } from '@heroui/react';
import { cn } from '../../../../core/cn.js';
import { DunetaCheckbox, type DunetaCheckboxProps } from '../../DunetaCheckbox';
import { SELECTION_COLUMN_ID } from '../constants';
import type { DunetaDataTableRowSelectionConfig } from '../types';

/** Visible on both `bg-surface-secondary` header cells and default row cells. */
const SELECTION_CHECKBOX_CONTROL_CLASS = cn(
  'border-accent bg-white shadow-sm',
  'dark:bg-zinc-900',
  'data-[selected=true]:border-transparent data-[selected=true]:bg-transparent',
  'data-[indeterminate=true]:border-transparent',
);

type TableSelectionCheckboxProps = Omit<
  DunetaCheckboxProps,
  'slot' | 'children' | 'onChange'
> & {
  onSelectedChange?: (selected: boolean) => void;
};

export function TableSelectionCheckbox({
  onSelectedChange,
  ...props
}: TableSelectionCheckboxProps) {
  return (
    <DunetaCheckbox
      slot="selection"
      {...props}
      onChange={(isSelected) => {
        onSelectedChange?.(isSelected);
      }}
    >
      <Checkbox.Content>
        <Checkbox.Control className={SELECTION_CHECKBOX_CONTROL_CLASS}>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </DunetaCheckbox>
  );
}

export function isSelectionColumnId(columnId: string): boolean {
  return columnId === SELECTION_COLUMN_ID;
}

export function selectedIdsToRowSelection(
  selectedIds: readonly string[],
): RowSelectionState {
  return Object.fromEntries(selectedIds.map((id) => [id, true]));
}

export function rowSelectionToSelectedIds(
  state: RowSelectionState,
): string[] {
  return Object.keys(state).filter((id) => state[id]);
}

export function areSelectedIdsEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) return false;
  const rightIds = new Set(right);
  return left.every((id) => rightIds.has(id));
}

export function createSelectionColumn<TData>(
  config: Pick<DunetaDataTableRowSelectionConfig, 'groupSelection'>,
): ColumnDef<TData, unknown> {
  return {
    id: SELECTION_COLUMN_ID,
    size: 44,
    minSize: 44,
    maxSize: 44,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    header: () => (
      <TableSelectionCheckbox aria-label="Select all rows on this page" />
    ),
    cell: ({ row }) => {
      if (config.groupSelection && row.getCanExpand()) {
        return (
          <TableSelectionCheckbox
            aria-label="Select group"
            isSelected={row.getIsAllSubRowsSelected()}
            isIndeterminate={row.getIsSomeSelected()}
            onSelectedChange={(isSelected) => row.toggleSelected(isSelected)}
          />
        );
      }

      return (
        <TableSelectionCheckbox
          aria-label="Select row"
          isDisabled={!row.getCanSelect()}
        />
      );
    },
    meta: {
      pin: 'left',
      defaultWidth: 44,
      minWidth: 44,
      maxWidth: 44,
    },
  };
}
