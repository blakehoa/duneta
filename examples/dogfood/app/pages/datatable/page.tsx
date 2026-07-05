import type { SortDescriptor } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';
import { DunetaButton } from 'duneta/views/component/DunetaButton';
import { DunetaButtonGroup } from 'duneta/views/component/DunetaButtonGroup';
import { DunetaChip } from 'duneta/views/component/DunetaChip';
import {
  DunetaDataTable,
  type ColumnDef,
  type DunetaDataTableDataType,
} from 'duneta/views/component/DunetaDataTable';
import { DunetaLabel } from 'duneta/views/component/DunetaLabel';
import { DunetaLink as Link } from 'duneta/views/component/DunetaLink';
import { DunetaTypography } from 'duneta/views/component/DunetaTypography';
import {
  createDemoProductRows,
  type DemoProductRow,
} from '~/lib/datatable-demo-data';

const ROW_COUNT = 50;
const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [20];

// en-US grouping is stable across Node SSR and browsers (vi-VN ICU can differ).
const vndFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatVnd(amount: number): string {
  return `${vndFormatter.format(amount)} ₫`;
}

const columns: Array<ColumnDef<DemoProductRow, unknown>> = [
  {
    id: 'sku',
    accessorKey: 'sku',
    header: 'SKU',
    meta: { defaultWidth: 120, minWidth: 80 },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Product',
    meta: { defaultWidth: 'auto', minWidth: 160, pin: 'left' },
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    meta: { defaultWidth: 140, groupable: true },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: { groupable: true },
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');
      const color =
        value === 'active'
          ? 'success'
          : value === 'draft'
            ? 'warning'
            : 'default';

      return (
        <DunetaChip color={color} size="sm" variant="soft">
          <DunetaChip.Label className="capitalize">{value}</DunetaChip.Label>
        </DunetaChip>
      );
    },
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: 'Price',
    meta: { defaultWidth: 130, maxWidth: 200 },
    cell: ({ getValue }) => formatVnd(Number(getValue() ?? 0)),
  },
  { id: 'stock', accessorKey: 'stock', header: 'Stock' },
  {
    id: 'margin',
    accessorKey: 'margin',
    header: 'Margin %',
    cell: ({ getValue }) => `${getValue()}%`,
  },
  {
    id: 'supplier',
    accessorKey: 'supplier',
    header: 'Supplier',
    meta: { groupable: true },
  },
  { id: 'warehouse', accessorKey: 'warehouse', header: 'WH' },
  { id: 'updatedAt', accessorKey: 'updatedAt', header: 'Updated' },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: 'Notes',
    meta: { defaultWidth: 220 },
  },
  {
    id: 'weight',
    accessorKey: 'weight',
    header: 'Weight (kg)',
    cell: ({ getValue }) => Number(getValue()).toFixed(2),
  },
  { id: 'origin', accessorKey: 'origin', header: 'Origin' },
  { id: 'batch', accessorKey: 'batch', header: 'Batch' },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <DunetaButton size="sm" variant="ghost">
        View
      </DunetaButton>
    ),
    enableSorting: false,
    meta: { pin: 'right' },
  },
];

function compareRows(
  a: DemoProductRow,
  b: DemoProductRow,
  descriptor: SortDescriptor | undefined,
): number {
  if (!descriptor?.column) return 0;

  const key = String(descriptor.column) as keyof DemoProductRow;
  const left = a[key];
  const right = b[key];
  const direction = descriptor.direction === 'descending' ? -1 : 1;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * direction;
  }

  return String(left ?? '').localeCompare(String(right ?? '')) * direction;
}

function fetchServerPage(
  rows: DemoProductRow[],
  page: number,
  pageSize: number,
  sort: SortDescriptor | undefined,
  query: string,
): DemoProductRow[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered =
    normalizedQuery.length === 0
      ? rows
      : rows.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(normalizedQuery),
          ),
        );
  const sorted = [...filtered].sort((a, b) => compareRows(a, b, sort));
  const start = (page - 1) * pageSize;
  return sorted.slice(start, start + pageSize);
}

export function meta() {
  return [
    { title: 'DataTable demo — Duneta' },
    {
      name: 'description',
      content: 'DunetaDataTable test: static vs dynamic data modes.',
    },
  ];
}

export default function DataTableDemoPage() {
  const allRows = useMemo(() => createDemoProductRows(ROW_COUNT), []);
  const [dataType, setDataType] = useState<DunetaDataTableDataType>('dynamic');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >();

  const dynamicRows = useMemo(() => {
    void refreshNonce;
    return fetchServerPage(allRows, page, PAGE_SIZE, sortDescriptor, searchQuery);
  }, [allRows, page, refreshNonce, searchQuery, sortDescriptor]);

  const tableData = dataType === 'static' ? allRows : dynamicRows;

  const handleDataTypeChange = useCallback((next: DunetaDataTableDataType) => {
    setDataType(next);
    setPage(1);
    setSortDescriptor(undefined);
    setSelectedIds([]);
    setSearchQuery('');
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            Playground
          </p>
          <DunetaTypography.Heading
            level={1}
            className="text-3xl font-semibold"
          >
            DunetaDataTable
          </DunetaTypography.Heading>
          <DunetaTypography.Paragraph className="max-w-2xl text-sm leading-6 text-muted">
            {ROW_COUNT} rows · {columns.length} columns · {PAGE_SIZE} rows/page
            · drag · resize · pin · row selection · sort · toolbar. Route:{' '}
            <DunetaTypography.Code>/datatable</DunetaTypography.Code>
          </DunetaTypography.Paragraph>
        </div>
        <Link
          href="/about"
          className="text-sm text-cyan-700 hover:underline dark:text-cyan-300"
        >
          ← About
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <DunetaLabel className="text-sm text-muted">dataType</DunetaLabel>
        <DunetaButtonGroup>
          {(['static', 'dynamic'] as const).map((mode) => (
            <DunetaButton
              key={mode}
              size="sm"
              variant={dataType === mode ? 'primary' : 'secondary'}
              onPress={() => handleDataTypeChange(mode)}
            >
              {mode}
            </DunetaButton>
          ))}
        </DunetaButtonGroup>
        <DunetaTypography.Paragraph className="text-xs text-muted">
          {dataType === 'static'
            ? 'Full dataset in table — client sort & pagination'
            : 'Simulated server page — server sort & pagination'}
        </DunetaTypography.Paragraph>
      </div>

      <DunetaDataTable<DemoProductRow>
        ariaLabel="Product catalog test"
        columnDrag
        columnResize
        dataType={dataType}
        data={tableData}
        columns={columns}
        getRowId={(row) => row.id}
        // rowSelection={{
        //   selectedIds,
        //   onChange: setSelectedIds,
        // }}
        sort={
          dataType === 'dynamic'
            ? {
                descriptor: sortDescriptor,
                onChange: (descriptor) => {
                  setSortDescriptor(descriptor);
                  setPage(1);
                },
              }
            : undefined
        }
        pagination={{
          total: dataType === 'dynamic' ? allRows.length : undefined,
          page,
          pageSize: PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPage,
        }}
        toolbar={{
          search:
            dataType === 'dynamic'
              ? {
                  onChange: (query) => {
                    setSearchQuery(query);
                    setPage(1);
                  },
                }
              : true,
          filter: { activeCount: 0 },
          group: true,
          column: {
            lockedColumnIds: ['name', 'actions'],
            hiddenByDefault: ['notes', 'batch'],
          },
        }}
        onRefresh={() => setRefreshNonce((nonce) => nonce + 1)}
        height="300px"
      />

      {selectedIds.length > 0 ? (
        <DunetaTypography.Paragraph className="text-sm text-muted">
          Selected {selectedIds.length} row{selectedIds.length === 1 ? '' : 's'}
          :{' '}
          <DunetaTypography.Code>
            {selectedIds.join(', ')}
          </DunetaTypography.Code>
        </DunetaTypography.Paragraph>
      ) : null}
    </main>
  );
}
