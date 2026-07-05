import type {
  Column,
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  Header,
  Table as ReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import type { CSSProperties } from 'react';
import type { DunetaTableColumnProps } from '../../DunetaTable';
import { cn } from '../../../../core/cn.js';
import type {
  ColumnWidthValue,
  DunetaDataTableColumnMeta,
} from '../types/column-meta';
import { isSelectionColumnId } from './row-selection';

// --- feature toggles (drag / resize) ---

export type ColumnFeatureConfig =
  | true
  | false
  | null
  | undefined
  | readonly string[];

export type ColumnDragConfig = ColumnFeatureConfig;
export type ColumnResizeConfig = ColumnFeatureConfig;
export type { ColumnPinningState };

function isFeatureEnabled(config: ColumnFeatureConfig): boolean {
  if (config === true) return true;
  if (config === false || config == null) return false;
  if (Array.isArray(config)) return config.length > 0;
  return false;
}

function isFeatureAllowed(
  config: ColumnFeatureConfig,
  columnId: string,
): boolean {
  if (config === true) return true;
  if (config === false || config == null) return false;
  if (Array.isArray(config)) return config.includes(columnId);
  return false;
}

export const isColumnDragEnabled = isFeatureEnabled;
export const isColumnResizeEnabled = isFeatureEnabled;
export const isColumnResizable = isFeatureAllowed;

export function isColumnDraggable(
  config: ColumnDragConfig,
  columnId: string,
  isPinned = false,
): boolean {
  if (isSelectionColumnId(columnId) || isPinned) return false;
  return isFeatureAllowed(config, columnId);
}

// --- column ids & pinning state ---

export function resolveColumnId<TData>(
  column: ColumnDef<TData, unknown>,
  index: number,
): string {
  if (column.id) return column.id;
  const accessorKey = (column as { accessorKey?: string | number }).accessorKey;
  if (accessorKey != null) return String(accessorKey);
  return `column-${index}`;
}

/** `meta.pin` on column defs → TanStack `columnPinning` state. */
export function createInitialColumnPinning<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
): ColumnPinningState {
  const left: string[] = [];
  const right: string[] = [];

  columns.forEach((column, index) => {
    const id = resolveColumnId(column, index);
    const pin = column.meta?.pin;
    if (pin === 'left') left.push(id);
    if (pin === 'right') right.push(id);
  });

  return { left, right };
}

/** `columnOrder` only tracks unpinned columns when pinning is active. */
export function createInitialColumnOrder<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
  pinning?: ColumnPinningState,
): ColumnOrderState {
  const ids = columns.map((column, index) => resolveColumnId(column, index));
  if (!pinning) return ids;

  const pinned = new Set([...(pinning.left ?? []), ...(pinning.right ?? [])]);
  if (pinned.size === 0) return ids;

  return ids.filter((id) => !pinned.has(id));
}

export function getTablePinnedColumnIds<TData>(
  table: ReactTable<TData>,
): string[] {
  const { left = [], right = [] } = table.getState().columnPinning;
  return [...left, ...right];
}

export function isColumnPinned<TData>(column: Column<TData, unknown>): boolean {
  return column.getIsPinned() !== false;
}

type PinLayer = 'header' | 'body';

export function getColumnPinPresentation<TData>(
  column: Column<TData, unknown>,
  table: ReactTable<TData>,
  layer: PinLayer,
): { className: string; style: CSSProperties } {
  const pinned = column.getIsPinned();
  if (!pinned) {
    return { className: '', style: {} };
  }

  const { left = [], right = [] } = table.getState().columnPinning;
  const isLastLeft = pinned === 'left' && left[left.length - 1] === column.id;
  const isFirstRight = pinned === 'right' && right[0] === column.id;

  return {
    className: cn(
      'sticky',
      layer === 'header'
        ? 'top-0 z-30 !bg-surface-secondary'
        : 'z-[1] !bg-surface',
      isLastLeft && 'shadow-[inset_-1px_0_0_0_var(--separator)]',
      isFirstRight && 'shadow-[inset_1px_0_0_0_var(--separator)]',
    ),
    style: {
      left: pinned === 'left' ? column.getStart('left') : undefined,
      right: pinned === 'right' ? column.getAfter('right') : undefined,
      width: column.getSize(),
      minWidth: column.getSize(),
      maxWidth: column.getSize(),
    },
  };
}

// --- column sizing (HeroUI RAC + TanStack) ---

export const DEFAULT_COLUMN_MIN_WIDTH_PX = 80;
const DEFAULT_COLUMN_SIZE_PX = 150;

export type ResolvedColumnWidthProps = Pick<
  DunetaTableColumnProps,
  'defaultWidth' | 'minWidth' | 'maxWidth'
>;

function parsePx(value: string): number | undefined {
  const match = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());
  return match ? Number(match[1]) : undefined;
}

function toPxNumber(value: ColumnWidthValue | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return parsePx(value);
}

function clampWidth(
  width: number,
  minWidth: number,
  maxWidth?: number,
): number {
  const aboveMin = Math.max(width, minWidth);
  return maxWidth !== undefined ? Math.min(aboveMin, maxWidth) : aboveMin;
}

function resolveMinWidth(meta?: DunetaDataTableColumnMeta): number {
  const min = meta?.minWidth;
  if (min === undefined) return DEFAULT_COLUMN_MIN_WIDTH_PX;
  return toPxNumber(min) ?? DEFAULT_COLUMN_MIN_WIDTH_PX;
}

function resolveMaxWidthPx(
  meta?: DunetaDataTableColumnMeta,
): number | undefined {
  const max = meta?.maxWidth;
  if (max === undefined || max === 'auto') return undefined;
  if (typeof max === 'number') return max;
  return toPxNumber(max);
}

export function resolveColumnWidthProps(
  meta?: DunetaDataTableColumnMeta,
): ResolvedColumnWidthProps {
  const minWidth = resolveMinWidth(meta);
  const maxWidth = resolveMaxWidthPx(meta);

  const rawDefault = meta?.defaultWidth;
  let defaultWidth: ResolvedColumnWidthProps['defaultWidth'];

  if (rawDefault === undefined || rawDefault === 'auto') {
    defaultWidth = '1fr' as const;
  } else if (typeof rawDefault === 'number') {
    defaultWidth = clampWidth(rawDefault, minWidth, maxWidth);
  } else if (/^\d+fr$/.test(rawDefault)) {
    defaultWidth = rawDefault as `${number}fr`;
  } else {
    const parsed = toPxNumber(rawDefault);
    defaultWidth =
      parsed !== undefined
        ? clampWidth(parsed, minWidth, maxWidth)
        : undefined;
  }

  return {
    defaultWidth,
    minWidth,
    ...(maxWidth !== undefined ? { maxWidth } : {}),
  };
}

export function resolveHeaderColumnWidthProps<TData>(
  header: Header<TData, unknown>,
  resizeEnabled: boolean,
): ResolvedColumnWidthProps {
  if (!resizeEnabled) return {};

  return {
    ...resolveColumnWidthProps(header.column.columnDef.meta),
    defaultWidth: header.column.getSize(),
  };
}

function resolveTanStackColumnSize(meta?: DunetaDataTableColumnMeta): number {
  const raw = meta?.defaultWidth;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const px = parsePx(raw);
    if (px !== undefined) return px;
  }
  return DEFAULT_COLUMN_SIZE_PX;
}

export function withTanStackColumnSizing<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
): Array<ColumnDef<TData, unknown>> {
  return columns.map((column) => ({
    ...column,
    size: column.size ?? resolveTanStackColumnSize(column.meta),
    minSize: column.minSize ?? DEFAULT_COLUMN_MIN_WIDTH_PX,
  }));
}

/** TanStack `columnSizing` baseline from column defs (used for width reset). */
export function createInitialColumnSizing<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
): ColumnSizingState {
  const sizing: ColumnSizingState = {};
  columns.forEach((column, index) => {
    const id = resolveColumnId(column, index);
    sizing[id] = column.size ?? resolveTanStackColumnSize(column.meta);
  });
  return sizing;
}

export function createInitialColumnVisibility<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
  options?: { hiddenByDefault?: string[] },
): VisibilityState {
  const hiddenIds = new Set(options?.hiddenByDefault ?? []);
  const visibility: VisibilityState = {};

  columns.forEach((column, index) => {
    const id = resolveColumnId(column, index);
    if (column.meta?.defaultHidden || hiddenIds.has(id)) {
      visibility[id] = false;
    }
  });

  return visibility;
}
