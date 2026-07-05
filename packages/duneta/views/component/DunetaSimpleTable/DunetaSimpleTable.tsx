import type { DunetaSimpleTableColumn, DunetaSimpleTableProps } from './types';

export type { DunetaSimpleTableColumn, DunetaSimpleTableProps };

export function DunetaSimpleTable<T>({
  data,
  columns,
  getRowKey,
  emptyState = 'No data yet.',
  className = '',
}: DunetaSimpleTableProps<T>) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}
    >
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-medium ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                    {column.render?.(row) ?? String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
