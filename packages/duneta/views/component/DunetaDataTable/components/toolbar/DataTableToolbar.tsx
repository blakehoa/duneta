
import { cn } from '../../../../../core/cn.js';
import { DataTableToolbarActions } from './DataTableToolbarActions';
import { DataTableToolbarSearch } from './DataTableToolbarSearch';
import type { DataTableToolbarProps } from './types';

export type { DataTableToolbarProps } from './types';

export function DataTableToolbar<TData extends object>({
  table,
  config,
  groupingColumnId,
  onGroupingChange,
  onSearchChange,
  columnReset,
  showRefresh,
  onRefresh,
  isRefreshing,
}: DataTableToolbarProps<TData>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-b border-border px-3 py-2.5',
      )}
    >
      {config.search ? (
        <DataTableToolbarSearch
          config={config.search}
          onDebouncedChange={onSearchChange}
        />
      ) : null}

      <DataTableToolbarActions
        table={table}
        config={config}
        groupingColumnId={groupingColumnId}
        onGroupingChange={onGroupingChange}
        columnReset={columnReset}
        showRefresh={showRefresh}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
