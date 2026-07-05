import type { ColumnDef, ColumnPinningState } from '@tanstack/react-table';
import type { SortDescriptor } from '@heroui/react';
import type { ReactNode } from 'react';
import type { DunetaTableProps } from '../DunetaTable/types';
import type { ColumnDragConfig, ColumnResizeConfig } from './core/columns';
import type { DunetaDataTableToolbarConfig } from './types/toolbar';

export type DunetaDataTableDataType = 'static' | 'dynamic';

/** `false` / `null` / omitted disables row selection. Selection is scoped to the current page. */
export type DunetaDataTableRowSelectionConfig = {
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  /** When grouping is enabled, toggle all rows in a group. */
  groupSelection?: boolean;
};

export type DunetaDataTableSortConfig = {
  descriptor?: SortDescriptor;
  onChange: (descriptor: SortDescriptor) => void;
};

export type DunetaDataTableEmptyStateConfig = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export type DunetaDataTablePaginationConfig = {
  /**
   * Total row count for pagination UI.
   * Required for `dataType="dynamic"` (server total).
   * Ignored for `dataType="static"` — derived from `data.length`.
   */
  total?: number;
  pageSize: number;
  /** 1-based page index */
  page: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type DunetaDataTableProps<TData extends object> = {
  columns: Array<ColumnDef<TData, unknown>>;
  /** All rows for `static`; current server page for `dynamic`. */
  data: TData[];
  /**
   * `static` — client sort + pagination over full `data`.
   * `dynamic` (default) — server sort + pagination; render every row in `data` as-is.
   */
  dataType?: DunetaDataTableDataType;
  pagination?: false | DunetaDataTablePaginationConfig;
  /** Required when `dataType="dynamic"` and columns are sortable. */
  sort?: DunetaDataTableSortConfig;
  getRowId?: (row: TData, index: number) => string;
  ariaLabel?: string;
  className?: string;
  /**
   * HeroUI table shell variant. Default: `secondary`, matching Duneta's compact operational
   * table contract. `primary` is available when a larger HeroUI table shell is desired.
   */
  variant?: DunetaTableProps['variant'];
  /** Enable row virtualization when pagination is disabled. Default: false */
  virtual?: boolean;
  /**
   * Column reorder via drag.
   * - `true` — all columns draggable
   * - `false` / `null` / omitted — no drag
   * - `string[]` — only listed column ids are draggable
   */
  columnDrag?: ColumnDragConfig;
  /**
   * Column resize via drag handle on the header edge.
   * - `true` — all columns resizable
   * - `false` / `null` / omitted — no resize
   * - `string[]` — only listed column ids are resizable
   *
   * Per-column `meta.defaultWidth`, `meta.minWidth`, `meta.maxWidth` control sizing.
   */
  columnResize?: ColumnResizeConfig;
  /**
   * Row selection via checkbox column (pinned left). Scoped to the current page.
   * Requires stable row ids — pass `getRowId` when rows lack an `id` field.
   */
  rowSelection?: false | null | DunetaDataTableRowSelectionConfig;
  /** Max height of the scrollable table body (`tbody`). Header and pagination footer stay fixed. */
  height?: number | string;
  /** Explicit empty state content. Keep it short and actionable for operational screens. */
  emptyState?: DunetaDataTableEmptyStateConfig;
  /**
   * Header toolbar with search, filter, group, and column controls.
   * `true` enables all features with defaults.
   */
  toolbar?: boolean | DunetaDataTableToolbarConfig | false | null;
  /**
   * Refetch handler for `dataType="dynamic"`. Shows an icon-only refresh button in the toolbar.
   */
  onRefresh?: () => void;
  /** Disables the refresh button and shows a spinner while a refetch is in flight. */
  isRefreshing?: boolean;
};

export type { ColumnDef };
export type { ColumnDragConfig, ColumnResizeConfig, ColumnPinningState };
export type {
  ColumnDefaultWidth,
  ColumnMaxWidth,
  ColumnWidthValue,
  DunetaDataTableColumnMeta,
} from './types/column-meta';
export type {
  DunetaDataTableToolbarConfig,
  DunetaDataTableToolbarSearchConfig,
  DunetaDataTableToolbarFilterConfig,
  DunetaDataTableToolbarGroupConfig,
  DunetaDataTableToolbarColumnConfig,
  DataTableColumnResetHandlers,
} from './types/toolbar';
