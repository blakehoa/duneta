import type { DunetaLayoutSectionGridProps } from './types';

const columnsClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

export function DunetaLayoutGrid({ children, columns = 1, className = '' }: DunetaLayoutSectionGridProps) {
  return <div className={`grid gap-4 ${columnsClass[columns]} ${className}`}>{children}</div>;
}
