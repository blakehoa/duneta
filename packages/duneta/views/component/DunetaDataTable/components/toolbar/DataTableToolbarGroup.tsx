
import { Layers } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DataTableToolbarGroupList } from './DataTableToolbarGroupList';
import { DataTableToolbarPanel } from './DataTableToolbarPanel';
import { DataTableToolbarPanelSearch } from './DataTableToolbarPanelSearch';
import { ToolbarActionButton } from './ToolbarActionButton';
import { useDraftOnOpen } from './use-draft-on-open';
import type { ToolbarColumnOption } from './types';

type DataTableToolbarGroupProps = {
  groupColumnOptions: ToolbarColumnOption[];
  groupingColumnId: string | null;
  onGroupingChange: (columnId: string | null) => void;
};

export function DataTableToolbarGroup({
  groupColumnOptions,
  groupingColumnId,
  onGroupingChange,
}: DataTableToolbarGroupProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draftGroupingColumnId, setDraftGroupingColumnId] = useDraftOnOpen(
    open,
    groupingColumnId,
  );

  const triggerLabel = useMemo(() => {
    if (!groupingColumnId) return 'Group';

    const label =
      groupColumnOptions.find((column) => column.id === groupingColumnId)
        ?.label ?? groupingColumnId;

    return `Group: ${label}`;
  }, [groupColumnOptions, groupingColumnId]);

  const handleApply = useCallback(() => {
    onGroupingChange(draftGroupingColumnId);
  }, [draftGroupingColumnId, onGroupingChange]);

  return (
    <DataTableToolbarPanel
      open={open}
      title="Group"
      trigger={
        <ToolbarActionButton
          label={triggerLabel}
          icon={<Layers aria-hidden className="size-4" strokeWidth={2} />}
        />
      }
      onApply={handleApply}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-3 px-3 py-3">
        <DataTableToolbarPanelSearch
          ariaLabel="Search group columns"
          placeholder="Search columns…"
          onQueryChange={setSearchQuery}
        />
        <DataTableToolbarGroupList
          draftGroupingColumnId={draftGroupingColumnId}
          options={groupColumnOptions}
          searchQuery={searchQuery}
          onDraftChange={setDraftGroupingColumnId}
        />
      </div>
    </DataTableToolbarPanel>
  );
}
