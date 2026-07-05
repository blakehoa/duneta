
import type { Table as ReactTable } from '@tanstack/react-table';
import type {
  DataTableColumnResetHandlers,
  ResolvedDunetaDataTableToolbarConfig,
} from '../../types/toolbar';
import { DataTableToolbarColumns } from './DataTableToolbarColumns';
import { DataTableToolbarFilter } from './DataTableToolbarFilter';
import { DataTableToolbarGroup } from './DataTableToolbarGroup';
import { DataTableToolbarRefresh } from './DataTableToolbarRefresh';
import { useToolbarColumnOptions } from './use-toolbar-column-options';
import { useToolbarGroupColumnOptions } from './use-toolbar-group-options';

type DataTableToolbarActionsProps<TData extends object> = {
  table: ReactTable<TData>;
  config: ResolvedDunetaDataTableToolbarConfig;
  groupingColumnId: string | null;
  onGroupingChange: (columnId: string | null) => void;
  columnReset: DataTableColumnResetHandlers;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function DataTableToolbarActions<TData extends object>({
  table,
  config,
  groupingColumnId,
  onGroupingChange,
  columnReset,
  showRefresh,
  onRefresh,
  isRefreshing,
}: DataTableToolbarActionsProps<TData>) {
  const columnVisibility = table.getState().columnVisibility;
  const { columnOptions, toggleableColumns, toggleableColumnOptions } =
    useToolbarColumnOptions(table, config.column);
  const { groupColumnOptions } = useToolbarGroupColumnOptions(
    table,
    config.group ?? {},
    columnOptions,
  );

  return (
    <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
      {showRefresh && onRefresh ? (
        <DataTableToolbarRefresh
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      ) : null}
      {config.filter ? <DataTableToolbarFilter config={config.filter} /> : null}
      {config.group ? (
        <DataTableToolbarGroup
          groupColumnOptions={groupColumnOptions}
          groupingColumnId={groupingColumnId}
          onGroupingChange={onGroupingChange}
        />
      ) : null}
      {config.column ? (
        <DataTableToolbarColumns
          toggleableColumns={toggleableColumns}
          columnOptions={toggleableColumnOptions}
          columnVisibility={columnVisibility}
          onReset={columnReset}
        />
      ) : null}
    </div>
  );
}
