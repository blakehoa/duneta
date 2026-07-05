import type { DunetaDataTableToolbarGroupConfig } from '../types/toolbar';
import type { DunetaDataTableColumnMeta } from '../types/column-meta';
import { isSelectionColumnId } from './row-selection';

export type GroupableColumnRef = {
  id: string;
  meta?: DunetaDataTableColumnMeta;
};

/**
 * Resolves which columns may be grouped.
 * - `group.columnIds` — explicit whitelist (highest priority)
 * - any `meta.groupable === true` — only those columns
 * - any `meta.groupable === false` — all except opted-out columns
 * - otherwise — all data columns
 */
export function resolveGroupableColumnIds(
  columns: ReadonlyArray<GroupableColumnRef>,
  groupConfig?: DunetaDataTableToolbarGroupConfig | null,
): string[] | null {
  const dataColumns = columns.filter((column) => !isSelectionColumnId(column.id));

  if (groupConfig?.columnIds?.length) {
    const allowed = new Set(groupConfig.columnIds);
    return dataColumns
      .filter((column) => allowed.has(column.id))
      .map((column) => column.id);
  }

  const explicitGroupable = dataColumns.filter(
    (column) => column.meta?.groupable === true,
  );
  if (explicitGroupable.length > 0) {
    return explicitGroupable.map((column) => column.id);
  }

  const hasOptOut = dataColumns.some((column) => column.meta?.groupable === false);
  if (hasOptOut) {
    return dataColumns
      .filter((column) => column.meta?.groupable !== false)
      .map((column) => column.id);
  }

  return null;
}

export function isColumnGroupable(
  columnId: string,
  groupableColumnIds: string[] | null,
): boolean {
  if (isSelectionColumnId(columnId)) return false;
  if (groupableColumnIds == null) return true;
  return groupableColumnIds.includes(columnId);
}
