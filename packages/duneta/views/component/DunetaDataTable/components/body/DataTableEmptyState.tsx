
import type { DunetaDataTableEmptyStateConfig } from '../../types';

type DataTableEmptyStateProps = {
  columnCount: number;
  emptyState?: DunetaDataTableEmptyStateConfig;
};

export function DataTableEmptyState({ columnCount, emptyState }: DataTableEmptyStateProps) {
  const title = emptyState?.title ?? 'No rows found';
  const description = emptyState?.description ?? 'Adjust the current filters or refresh the data.';

  return (
    <div
      className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 py-8 text-center"
      data-column-count={columnCount}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-xs text-muted">{description}</p> : null}
      {emptyState?.action ? <div className="mt-1">{emptyState.action}</div> : null}
    </div>
  );
}
