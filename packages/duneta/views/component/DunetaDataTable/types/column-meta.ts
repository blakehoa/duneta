export type ColumnWidthValue = number | string;

/** Initial column width. `auto` / omitted shares free space (`1fr`). */
export type ColumnDefaultWidth = 'auto' | ColumnWidthValue | undefined;

/** Max width. `auto` / omitted = no upper bound while resizing. */
export type ColumnMaxWidth = 'auto' | ColumnWidthValue | undefined;

export type DunetaDataTableColumnMeta = {
  defaultWidth?: ColumnDefaultWidth;
  minWidth?: ColumnWidthValue | undefined;
  maxWidth?: ColumnMaxWidth;
  /** Freeze column on horizontal scroll. Synced to TanStack `columnPinning` state. */
  pin?: 'left' | 'right';
  /** Hidden until user toggles visibility in the column panel. */
  defaultHidden?: boolean;
  /** When `true`, column appears in the group picker. When `false`, excluded from grouping. */
  groupable?: boolean;
};

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars -- TanStack module augmentation
  interface ColumnMeta<TData, TValue> extends DunetaDataTableColumnMeta {}
}
