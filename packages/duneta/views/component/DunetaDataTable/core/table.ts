import type { Header, Table as ReactTable } from '@tanstack/react-table';
import { TABLE_HEADER_HEIGHT } from '../constants';

export function getHeaderLabel<TData>(header: Header<TData, unknown>): string {
  const def = header.column.columnDef.header;
  if (typeof def === 'string') return def;
  return header.column.id;
}

export function getDataTableEngineState<TData extends object>(
  table: ReactTable<TData>,
) {
  const headers = table.getHeaderGroups()[0]?.headers ?? [];
  return {
    headers,
    columnCount: headers.length,
    rows: table.getRowModel().rows,
  };
}

/** Scroll viewport = sticky header + body max-height. */
export function resolveTableScrollMaxHeight(
  bodyMaxHeight: number | string,
): number | string {
  if (typeof bodyMaxHeight === 'number') {
    return TABLE_HEADER_HEIGHT + bodyMaxHeight;
  }

  return `calc(${bodyMaxHeight} + ${TABLE_HEADER_HEIGHT}px)`;
}
