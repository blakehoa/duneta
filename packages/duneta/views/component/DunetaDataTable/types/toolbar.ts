import type { ReactNode } from 'react';

export type DunetaDataTableToolbarSearchConfig = {
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  /** Fired after debounce. Omit for client-side global filter in `dataType="static"`. */
  onChange?: (query: string) => void;
};

export type DunetaDataTableToolbarFilterConfig = {
  /** Badge count on the filter button. */
  activeCount?: number;
  /** Custom filter panel content (manage draft state internally). */
  children?: ReactNode;
  /** Commits filter draft when user presses Apply. */
  onApply?: () => void;
};

export type DunetaDataTableToolbarGroupConfig = {
  /**
   * Column ids eligible for grouping (whitelist).
   * Overrides `meta.groupable` on column defs.
   */
  columnIds?: string[];
  /** Controlled group column id. `null` clears grouping. */
  value?: string | null;
  onChange?: (columnId: string | null) => void;
};

export type DunetaDataTableToolbarColumnConfig = {
  /** Column ids that cannot be hidden. */
  lockedColumnIds?: string[];
  /** Column ids hidden when visibility is reset. Merged with `meta.defaultHidden`. */
  hiddenByDefault?: string[];
};

export type DataTableColumnResetHandlers = {
  resetAll: () => void;
  resetWidths: () => void;
  resetOrder: () => void;
  resetVisibility: () => void;
  getDefaultVisibleColumnIds: () => string[];
};

export type DunetaDataTableToolbarFeatureConfig<T> = boolean | T;

export type DunetaDataTableToolbarConfig = {
  search?: DunetaDataTableToolbarFeatureConfig<DunetaDataTableToolbarSearchConfig>;
  filter?: DunetaDataTableToolbarFeatureConfig<DunetaDataTableToolbarFilterConfig>;
  group?: DunetaDataTableToolbarFeatureConfig<DunetaDataTableToolbarGroupConfig>;
  column?: DunetaDataTableToolbarFeatureConfig<DunetaDataTableToolbarColumnConfig>;
};

export type ResolvedDunetaDataTableToolbarConfig = {
  search: DunetaDataTableToolbarSearchConfig | null;
  filter: DunetaDataTableToolbarFilterConfig | null;
  group: DunetaDataTableToolbarGroupConfig | null;
  column: DunetaDataTableToolbarColumnConfig | null;
};
