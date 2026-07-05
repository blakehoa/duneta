
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type GroupingState,
  type PaginationState,
  type ColumnSizingState,
  type SortingState,
  type Table as ReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { Selection } from '@heroui/react';
import {
  createInitialColumnOrder,
  createInitialColumnPinning,
  createInitialColumnSizing,
  createInitialColumnVisibility,
  resolveColumnId,
  withTanStackColumnSizing,
} from '../core/columns';
import { createColumnResetHandlers } from '../core/column-reset';
import { isDynamicDataType } from '../core/data-mode';
import {
  isColumnGroupable,
  resolveGroupableColumnIds,
} from '../core/group';
import {
  areSelectedIdsEqual,
  createSelectionColumn,
  selectedIdsToRowSelection,
} from '../core/row-selection';
import { toSortDescriptor, toSortingState } from '../core/sort';
import type {
  DunetaDataTableDataType,
  DunetaDataTablePaginationConfig,
  DunetaDataTableProps,
  DunetaDataTableRowSelectionConfig,
  DunetaDataTableSortConfig,
} from '../types';
import type {
  DataTableColumnResetHandlers,
  ResolvedDunetaDataTableToolbarConfig,
} from '../types/toolbar';

const EMPTY_SELECTED_IDS: string[] = [];

export type UseDunetaDataTableOptions<TData extends object> = {
  columns: Array<ColumnDef<TData, unknown>>;
  data: TData[];
  dataType?: DunetaDataTableDataType;
  pagination?: false | DunetaDataTablePaginationConfig;
  sort?: DunetaDataTableSortConfig;
  getRowId?: DunetaDataTableProps<TData>['getRowId'];
  rowSelection?: DunetaDataTableRowSelectionConfig;
  columnOrder?: ColumnOrderState;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  toolbar?: ResolvedDunetaDataTableToolbarConfig | null;
};

export function useDunetaDataTable<TData extends object>({
  columns,
  data,
  dataType,
  pagination = false,
  sort,
  getRowId,
  rowSelection: rowSelectionConfig,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  toolbar,
}: UseDunetaDataTableOptions<TData>): {
  table: ReactTable<TData>;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  columnOrder: ColumnOrderState;
  setColumnOrder: Dispatch<SetStateAction<ColumnOrderState>>;
  sortDescriptor: ReturnType<typeof toSortDescriptor>;
  rowSelectionEnabled: boolean;
  selectedRowCount: number;
  selectedKeys: Selection;
  onSelectionChange: (keys: Selection) => void;
  groupingColumnId: string | null;
  setGroupingColumnId: (columnId: string | null) => void;
  handleToolbarSearchChange: (query: string) => void;
  columnReset: DataTableColumnResetHandlers;
} {
  const isDynamic = isDynamicDataType(dataType);
  const paginationEnabled = pagination !== false;

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const rowSelectionEnabled = rowSelectionConfig != null;

  const sortingFromProps = useMemo(
    () => (sort?.descriptor ? toSortingState(sort.descriptor) : []),
    [sort?.descriptor],
  );

  const sorting = isDynamic ? sortingFromProps : internalSorting;

  const paginationState = useMemo((): PaginationState => {
    if (!paginationEnabled) {
      return { pageIndex: 0, pageSize: Math.max(data.length, 1) };
    }
    return {
      pageIndex: Math.max(0, pagination.page - 1),
      pageSize: pagination.pageSize,
    };
  }, [data.length, pagination, paginationEnabled]);

  const serverRowCount = useMemo(() => {
    if (!isDynamic || !paginationEnabled) return data.length;
    return pagination.total ?? data.length;
  }, [data.length, isDynamic, pagination, paginationEnabled]);

  const sizedColumns = useMemo(
    () => withTanStackColumnSizing(columns),
    [columns],
  );

  const groupableColumnIds = useMemo(
    () =>
      toolbar?.group
        ? resolveGroupableColumnIds(
            sizedColumns.map((column, index) => ({
              id: resolveColumnId(column, index),
              meta: column.meta,
            })),
            toolbar.group,
          )
        : null,
    [sizedColumns, toolbar?.group],
  );

  const sizedColumnsWithGrouping = useMemo(() => {
    if (!toolbar?.group) return sizedColumns;
    return sizedColumns.map((column, index) => ({
      ...column,
      enableGrouping: isColumnGroupable(
        resolveColumnId(column, index),
        groupableColumnIds,
      ),
    }));
  }, [groupableColumnIds, sizedColumns, toolbar?.group]);

  const groupSelection = rowSelectionConfig?.groupSelection ?? false;

  const tableColumns = useMemo(() => {
    if (!rowSelectionEnabled) return sizedColumnsWithGrouping;
    return [
      createSelectionColumn<TData>({ groupSelection }),
      ...sizedColumnsWithGrouping,
    ];
  }, [groupSelection, rowSelectionEnabled, sizedColumnsWithGrouping]);

  const columnPinningFromMeta = useMemo(
    () => createInitialColumnPinning(tableColumns),
    [tableColumns],
  );

  const columnOrderFromMeta = useMemo(
    () => createInitialColumnOrder(tableColumns, columnPinningFromMeta),
    [tableColumns, columnPinningFromMeta],
  );

  const initialColumnSizing = useMemo(
    () => createInitialColumnSizing(tableColumns),
    [tableColumns],
  );

  const initialColumnVisibility = useMemo(
    () =>
      createInitialColumnVisibility(tableColumns, {
        hiddenByDefault: toolbar?.column?.hiddenByDefault,
      }),
    [tableColumns, toolbar?.column?.hiddenByDefault],
  );

  const selectedIds = rowSelectionConfig?.selectedIds ?? EMPTY_SELECTED_IDS;

  const rowSelection = useMemo(
    () =>
      rowSelectionEnabled ? selectedIdsToRowSelection(selectedIds) : {},
    [rowSelectionEnabled, selectedIds],
  );

  const rowSelectionOnChangeRef = useRef(rowSelectionConfig?.onChange);
  rowSelectionOnChangeRef.current = rowSelectionConfig?.onChange;

  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const [columnPinning, setColumnPinning] =
    useState<ColumnPinningState>(columnPinningFromMeta);
  const [internalColumnOrder, setInternalColumnOrder] =
    useState<ColumnOrderState>(columnOrderFromMeta);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility,
  );
  const [columnSizing, setColumnSizing] =
    useState<ColumnSizingState>(initialColumnSizing);
  const [globalFilter, setGlobalFilter] = useState('');
  const [internalGroupingColumnId, setInternalGroupingColumnId] = useState<
    string | null
  >(null);

  // --- Toolbar: search (client global filter vs controlled onChange) ---
  const toolbarSearch = toolbar?.search ?? null;
  const toolbarGroup = toolbar?.group ?? null;
  const usesInternalSearch =
    toolbarSearch != null && toolbarSearch.onChange == null && !isDynamic;
  const usesInternalGrouping =
    toolbarGroup != null && toolbarGroup.onChange == null && !isDynamic;

  // --- Toolbar: grouping (client row model vs controlled onChange) ---
  const groupingColumnId =
    toolbarGroup?.value !== undefined
      ? toolbarGroup.value
      : internalGroupingColumnId;

  const grouping = useMemo(
    (): GroupingState =>
      groupingColumnId ? [groupingColumnId] : [],
    [groupingColumnId],
  );

  const setGroupingColumnId = useCallback(
    (columnId: string | null) => {
      if (columnId && !isColumnGroupable(columnId, groupableColumnIds)) return;

      if (toolbarGroup?.onChange) {
        toolbarGroup.onChange(columnId);
        return;
      }
      setInternalGroupingColumnId(columnId);
    },
    [groupableColumnIds, toolbarGroup],
  );

  useEffect(() => {
    if (
      groupingColumnId &&
      !isColumnGroupable(groupingColumnId, groupableColumnIds)
    ) {
      setGroupingColumnId(null);
    }
  }, [groupableColumnIds, groupingColumnId, setGroupingColumnId]);

  const handleToolbarSearchChange = useCallback(
    (query: string) => {
      if (toolbarSearch?.onChange) {
        toolbarSearch.onChange(query);
        return;
      }
      if (usesInternalSearch) {
        setGlobalFilter(query);
      }
    },
    [toolbarSearch, usesInternalSearch],
  );

  useEffect(() => {
    setColumnPinning(columnPinningFromMeta);
    setInternalColumnOrder(columnOrderFromMeta);
    setColumnVisibility(initialColumnVisibility);
    setColumnSizing(initialColumnSizing);
  }, [
    columnOrderFromMeta,
    columnPinningFromMeta,
    initialColumnSizing,
    initialColumnVisibility,
  ]);

  const skipPageSelectionResetRef = useRef(true);
  useEffect(() => {
    if (!rowSelectionEnabled || !paginationEnabled) return;
    if (skipPageSelectionResetRef.current) {
      skipPageSelectionResetRef.current = false;
      return;
    }
    if (selectedIdsRef.current.length === 0) return;
    rowSelectionOnChangeRef.current?.([]);
  }, [paginationState.pageIndex, paginationEnabled, rowSelectionEnabled]);

  const columnOrder = controlledColumnOrder ?? internalColumnOrder;

  const setColumnOrder = useCallback<Dispatch<SetStateAction<ColumnOrderState>>>(
    (value) => {
      const next =
        typeof value === 'function' ? value(columnOrder) : value;
      if (onColumnOrderChange) {
        onColumnOrderChange(next);
        return;
      }
      setInternalColumnOrder(next);
    },
    [columnOrder, onColumnOrderChange],
  );

  // --- Column layout reset (widths, order, visibility, pinning) ---
  const columnReset = useMemo(
    () =>
      createColumnResetHandlers(
        {
          columnPinning: columnPinningFromMeta,
          columnOrder: columnOrderFromMeta,
          columnSizing: initialColumnSizing,
          columnVisibility: initialColumnVisibility,
          sizedColumns,
        },
        {
          setColumnPinning,
          setColumnOrder,
          setColumnSizing,
          setColumnVisibility,
        },
      ),
    [
      columnOrderFromMeta,
      columnPinningFromMeta,
      initialColumnSizing,
      initialColumnVisibility,
      setColumnOrder,
      sizedColumns,
    ],
  );

  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const current = isDynamic ? sortingFromProps : internalSorting;
    const next = typeof updater === 'function' ? updater(current) : updater;

    if (isDynamic) {
      const descriptor = toSortDescriptor(next);
      if (descriptor) sort?.onChange(descriptor);
      return;
    }

    setInternalSorting(next);
  };

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    if (!paginationEnabled) return;

    const next =
      typeof updater === 'function' ? updater(paginationState) : updater;

    if (next.pageIndex !== paginationState.pageIndex) {
      pagination.onPageChange?.(next.pageIndex + 1);
    }
    if (next.pageSize !== paginationState.pageSize) {
      pagination.onPageSizeChange?.(next.pageSize);
    }
  };

  const pageRowIdsRef = useRef<string[]>([]);

  const table = useReactTable({
    columns: tableColumns,
    data,
    getRowId,
    enableColumnPinning: true,
    enableGrouping: usesInternalGrouping,
    enableRowSelection: rowSelectionEnabled,
    enableMultiRowSelection: true,
    manualPagination: isDynamic,
    manualSorting: isDynamic,
    rowCount: isDynamic && paginationEnabled ? serverRowCount : undefined,
    pageCount:
      isDynamic && paginationEnabled
        ? Math.max(1, Math.ceil(serverRowCount / pagination.pageSize))
        : undefined,
    initialState: {
      columnPinning: columnPinningFromMeta,
      columnOrder: columnOrderFromMeta,
      columnSizing: initialColumnSizing,
      columnVisibility: initialColumnVisibility,
      rowSelection,
    },
    state: {
      sorting,
      columnOrder,
      columnPinning,
      columnVisibility,
      columnSizing,
      ...(usesInternalSearch ? { globalFilter } : {}),
      ...(usesInternalGrouping ? { grouping, expanded: true } : {}),
      ...(paginationEnabled ? { pagination: paginationState } : {}),
      ...(rowSelectionEnabled ? { rowSelection } : {}),
    },
    onSortingChange: handleSortingChange,
    onColumnOrderChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnOrder) : updater;
      setColumnOrder(next);
    },
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onGlobalFilterChange: usesInternalSearch ? setGlobalFilter : undefined,
    onGroupingChange: usesInternalGrouping
      ? (updater) => {
          const current = grouping;
          const next =
            typeof updater === 'function' ? updater(current) : updater;
          setGroupingColumnId(next[0] ?? null);
        }
      : undefined,
    onPaginationChange: paginationEnabled ? handlePaginationChange : undefined,
    onRowSelectionChange: rowSelectionEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function' ? updater(rowSelection) : updater;
          const pageIdSet = new Set(pageRowIdsRef.current);
          const pageIds = Object.keys(next).filter(
            (id) => next[id] && pageIdSet.has(id),
          );
          if (areSelectedIdsEqual(pageIds, selectedIdsRef.current)) return;
          rowSelectionOnChangeRef.current?.(pageIds);
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(!isDynamic
      ? {
          getSortedRowModel: getSortedRowModel(),
          ...(usesInternalSearch ? { getFilteredRowModel: getFilteredRowModel() } : {}),
          ...(usesInternalGrouping && grouping.length > 0
            ? {
                getGroupedRowModel: getGroupedRowModel(),
                getExpandedRowModel: getExpandedRowModel(),
              }
            : {}),
          ...(paginationEnabled
            ? { getPaginationRowModel: getPaginationRowModel() }
            : {}),
        }
      : {}),
  });

  pageRowIdsRef.current = table.getRowModel().rows.map((row) => row.id);

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);
  const selectedKeys = useMemo(
    () => new Set(selectedIds),
    [selectedIds],
  );

  const handleSelectionChange = useCallback((selection: Selection) => {
    const pageRowIds = pageRowIdsRef.current;
    const pageRowIdSet = new Set(pageRowIds);
    const ids =
      selection === 'all'
        ? pageRowIds
        : [...selection].map(String).filter((id) => pageRowIdSet.has(id));

    if (areSelectedIdsEqual(ids, selectedIdsRef.current)) return;
    rowSelectionOnChangeRef.current?.(ids);
  }, []);

  const selectedRowCount = selectedIds.length;

  return {
    table,
    sorting,
    setSorting: isDynamic
      ? () => {
          /* dynamic sort is controlled via `sort` prop */
        }
      : setInternalSorting,
    columnOrder,
    setColumnOrder,
    sortDescriptor,
    rowSelectionEnabled,
    selectedRowCount,
    selectedKeys,
    onSelectionChange: handleSelectionChange,
    groupingColumnId: toolbarGroup ? groupingColumnId : null,
    setGroupingColumnId,
    handleToolbarSearchChange,
    columnReset,
  };
}
