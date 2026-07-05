
import { cn } from '../../../../core/cn.js';
import { DEFAULT_TABLE_HEIGHT } from '../constants';

type DataTablePlaceholderProps = {
  className?: string;
  height?: number | string;
  ariaLabel?: string;
};

export function DataTablePlaceholder({
  className,
  height = DEFAULT_TABLE_HEIGHT,
  ariaLabel = 'Loading data table',
}: DataTablePlaceholderProps) {
  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn(
        'animate-pulse rounded-lg border border-border bg-surface',
        className,
      )}
      style={{ minHeight: height }}
    />
  );
}
