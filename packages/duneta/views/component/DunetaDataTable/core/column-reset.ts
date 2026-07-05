import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { DataTableColumnResetHandlers } from '../types/toolbar';
import { resolveColumnId } from './columns';

export type ColumnLayoutDefaults<TData> = {
  columnPinning: ColumnPinningState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  columnVisibility: VisibilityState;
  sizedColumns: Array<ColumnDef<TData, unknown>>;
};

type ColumnLayoutSetters = {
  setColumnPinning: (state: ColumnPinningState) => void;
  setColumnOrder: (state: ColumnOrderState) => void;
  setColumnSizing: (state: ColumnSizingState) => void;
  setColumnVisibility: (state: VisibilityState) => void;
};

/** Restores column pinning, order, sizing, and visibility to their initial values. */
export function createColumnResetHandlers<TData>(
  defaults: ColumnLayoutDefaults<TData>,
  setters: ColumnLayoutSetters,
): DataTableColumnResetHandlers {
  const {
    columnPinning,
    columnOrder,
    columnSizing,
    columnVisibility,
    sizedColumns,
  } = defaults;
  const {
    setColumnPinning,
    setColumnOrder,
    setColumnSizing,
    setColumnVisibility,
  } = setters;

  return {
    resetAll: () => {
      setColumnPinning(columnPinning);
      setColumnOrder(columnOrder);
      setColumnVisibility(columnVisibility);
      setColumnSizing(columnSizing);
    },
    resetWidths: () => setColumnSizing(columnSizing),
    resetOrder: () => setColumnOrder(columnOrder),
    resetVisibility: () => setColumnVisibility(columnVisibility),
    getDefaultVisibleColumnIds: () =>
      sizedColumns
        .map((column, index) => resolveColumnId(column, index))
        .filter((id) => columnVisibility[id] !== false),
  };
}
