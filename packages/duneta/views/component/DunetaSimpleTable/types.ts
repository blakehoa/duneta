import type { ReactNode } from 'react';

export type DunetaSimpleTableColumn<T> = {
  key: keyof T & string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
};

export type DunetaSimpleTableProps<T> = {
  data: readonly T[];
  columns: readonly DunetaSimpleTableColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  emptyState?: ReactNode;
  className?: string;
};
