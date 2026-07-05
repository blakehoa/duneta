
import { Check } from 'lucide-react';
import { cn } from '../../../../../core/cn.js';
import { DunetaTypography } from '../../../DunetaTypography';
import { filterToolbarOptions } from './filter-options';
import type { ToolbarColumnOption } from './types';

const NONE_GROUP_ID = '__none__';

type DataTableToolbarGroupListProps = {
  options: ToolbarColumnOption[];
  searchQuery: string;
  draftGroupingColumnId: string | null;
  onDraftChange: (columnId: string | null) => void;
};

type GroupListItem = {
  id: string;
  label: string;
};

export function DataTableToolbarGroupList({
  options,
  searchQuery,
  draftGroupingColumnId,
  onDraftChange,
}: DataTableToolbarGroupListProps) {
  const items: GroupListItem[] = [
    { id: NONE_GROUP_ID, label: 'None' },
    ...options,
  ];

  const filteredItems = filterToolbarOptions(items, searchQuery);

  if (filteredItems.length === 0) {
    return (
      <DunetaTypography.Paragraph className="px-1 py-2 text-sm text-muted">
        No columns match your search.
      </DunetaTypography.Paragraph>
    );
  }

  return (
    <ul
      className={cn(
        'flex max-h-52 flex-col gap-0.5 overflow-y-auto',
        'rounded-md border border-border/60 bg-surface p-1',
      )}
    >
      {filteredItems.map((item) => {
        const isSelected =
          item.id === NONE_GROUP_ID
            ? draftGroupingColumnId == null
            : draftGroupingColumnId === item.id;

        return (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                'hover:bg-surface-secondary',
                isSelected && 'bg-surface-secondary font-medium text-foreground',
              )}
              onClick={() =>
                onDraftChange(item.id === NONE_GROUP_ID ? null : item.id)
              }
            >
              <span
                className={cn(
                  'inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border',
                  isSelected && 'border-accent bg-accent text-accent-foreground',
                )}
              >
                {isSelected ? (
                  <Check aria-hidden className="size-2.5" strokeWidth={3} />
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
