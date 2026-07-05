
import type { Table as ReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { resolveGroupableColumnIds } from '../../core/group';
import { isSelectionColumnId } from '../../core/row-selection';
import type { DunetaDataTableToolbarGroupConfig } from '../../types/toolbar';
import type { ToolbarColumnOption } from './types';

export function useToolbarGroupColumnOptions<TData extends object>(
  table: ReactTable<TData>,
  groupConfig: DunetaDataTableToolbarGroupConfig,
  columnOptions: ToolbarColumnOption[],
) {
  const groupableColumnIds = useMemo(() => {
    const refs = table
      .getAllLeafColumns()
      .filter((column) => !isSelectionColumnId(column.id))
      .map((column) => ({
        id: column.id,
        meta: column.columnDef.meta,
      }));

    return resolveGroupableColumnIds(refs, groupConfig);
  }, [groupConfig, table]);

  const groupColumnOptions = useMemo(() => {
    if (groupableColumnIds == null) return columnOptions;
    const allowed = new Set(groupableColumnIds);
    return columnOptions.filter((column) => allowed.has(column.id));
  }, [columnOptions, groupableColumnIds]);

  return { groupColumnOptions };
}
