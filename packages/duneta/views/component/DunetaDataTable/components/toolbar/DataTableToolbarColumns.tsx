
import type { Column } from '@tanstack/react-table';
import { Columns3 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DunetaChip } from '../../../DunetaChip';
import { DunetaSeparator } from '../../../DunetaSeparator';
import type { DataTableColumnResetHandlers } from '../../types/toolbar';
import { DataTableToolbarColumnActions } from './DataTableToolbarColumnActions';
import { DataTableToolbarColumnList } from './DataTableToolbarColumnList';
import { DataTableToolbarPanel } from './DataTableToolbarPanel';
import { DataTableToolbarPanelSearch } from './DataTableToolbarPanelSearch';
import { ToolbarActionButton } from './ToolbarActionButton';
import { useDraftOnOpen } from './use-draft-on-open';
import { wrapResetHandlersWithClose } from './wrap-reset-handlers';
import type { ToolbarColumnOption } from './types';

type DataTableToolbarColumnsProps<TData> = {
  toggleableColumns: Array<Column<TData, unknown>>;
  columnOptions: ToolbarColumnOption[];
  columnVisibility: Record<string, boolean>;
  onReset: DataTableColumnResetHandlers;
};

function getVisibleColumnIds<TData>(
  columns: Array<Column<TData, unknown>>,
): Set<string> {
  return new Set(
    columns.filter((column) => column.getIsVisible()).map((column) => column.id),
  );
}

export function DataTableToolbarColumns<TData>({
  toggleableColumns,
  columnOptions,
  columnVisibility,
  onReset,
}: DataTableToolbarColumnsProps<TData>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Read column visibility each render because TanStack column objects expose mutable state.
  void columnVisibility;
  const appliedVisibleIds = getVisibleColumnIds(toggleableColumns);

  const [draftVisibleIds, setDraftVisibleIds] = useDraftOnOpen(
    open,
    appliedVisibleIds,
  );

  const appliedVisibleCount = appliedVisibleIds.size;

  const handleToggle = useCallback((columnId: string, visible: boolean) => {
    setDraftVisibleIds((current) => {
      const next = new Set(current);
      if (visible) next.add(columnId);
      else next.delete(columnId);
      return next;
    });
  }, [setDraftVisibleIds]);

  const handleApply = useCallback(() => {
    for (const column of toggleableColumns) {
      const visible = draftVisibleIds.has(column.id);
      if (column.getIsVisible() !== visible) {
        column.toggleVisibility(visible);
      }
    }
  }, [draftVisibleIds, toggleableColumns]);

  const resetHandlers = useMemo(
    () => wrapResetHandlersWithClose(onReset, () => setOpen(false)),
    [onReset],
  );

  return (
    <DataTableToolbarPanel
      open={open}
      title="Columns"
      titleExtra={
        <DunetaChip size="sm" variant="soft">
          <DunetaChip.Label>
            {open ? draftVisibleIds.size : appliedVisibleCount}/
            {toggleableColumns.length}
          </DunetaChip.Label>
        </DunetaChip>
      }
      trigger={
        <ToolbarActionButton
          label="Columns"
          icon={<Columns3 aria-hidden className="size-4" strokeWidth={2} />}
        />
      }
      onApply={handleApply}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-3 px-3 py-3">
        <DataTableToolbarPanelSearch
          ariaLabel="Search columns"
          placeholder="Search columns…"
          onQueryChange={setSearchQuery}
        />
        <DataTableToolbarColumnList
          columns={columnOptions}
          draftVisibleIds={draftVisibleIds}
          onToggle={handleToggle}
          searchQuery={searchQuery}
        />
      </div>

      <DunetaSeparator />

      <div className="px-3 py-3">
        <DataTableToolbarColumnActions onReset={resetHandlers} />
      </div>
    </DataTableToolbarPanel>
  );
}
