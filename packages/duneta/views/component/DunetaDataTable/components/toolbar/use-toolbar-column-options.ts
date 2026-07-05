
import type { Table as ReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { isSelectionColumnId } from '../../core/row-selection';
import { getHeaderLabel } from '../../core/table';
import type { DunetaDataTableToolbarColumnConfig } from '../../types/toolbar';
import type { ToolbarColumnOption } from './types';

const EMPTY_HEADERS: ReturnType<ReactTable<object>['getHeaderGroups']>[number]['headers'] = [];

export function useToolbarColumnOptions<TData extends object>(
  table: ReactTable<TData>,
  columnConfig: DunetaDataTableToolbarColumnConfig | null,
) {
  const headers = table.getHeaderGroups()[0]?.headers ?? EMPTY_HEADERS;

  const columnOptions = useMemo((): ToolbarColumnOption[] => {
    return headers
      .filter((header) => !isSelectionColumnId(header.column.id))
      .map((header) => ({
        id: header.column.id,
        label: getHeaderLabel(header),
      }));
  }, [headers]);

  const lockedColumnIds = useMemo(() => {
    const locked = new Set(columnConfig?.lockedColumnIds ?? []);
    for (const header of headers) {
      if (header.column.getIsPinned()) {
        locked.add(header.column.id);
      }
    }
    return locked;
  }, [columnConfig?.lockedColumnIds, headers]);

  const toggleableColumns = useMemo(() => {
    return table
      .getAllLeafColumns()
      .filter(
        (column) =>
          !isSelectionColumnId(column.id) && !lockedColumnIds.has(column.id),
      );
  }, [lockedColumnIds, table]);

  const toggleableColumnOptions = useMemo(() => {
    const toggleableIds = new Set(toggleableColumns.map((column) => column.id));
    return columnOptions.filter((column) => toggleableIds.has(column.id));
  }, [columnOptions, toggleableColumns]);

  return {
    columnOptions,
    toggleableColumns,
    toggleableColumnOptions,
  };
}
