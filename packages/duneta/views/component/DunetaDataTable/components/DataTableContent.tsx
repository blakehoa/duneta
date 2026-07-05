
import type { Selection, SortDescriptor } from '@heroui/react';
import type { ReactNode } from 'react';
import { cn } from '../../../../core/cn.js';
import { DunetaTable } from '../../DunetaTable';

type DataTableContentProps = {
  ariaLabel: string;
  resizeEnabled: boolean;
  sortDescriptor: SortDescriptor | undefined;
  onSortChange: (descriptor: SortDescriptor) => void;
  rowSelectionEnabled?: boolean;
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  children: ReactNode;
};

export function DataTableContent({
  ariaLabel,
  resizeEnabled,
  sortDescriptor,
  onSortChange,
  rowSelectionEnabled = false,
  selectedKeys,
  onSelectionChange,
  children,
}: DataTableContentProps) {
  return (
    <DunetaTable.Content
      aria-label={ariaLabel}
      className={cn(
        resizeEnabled ? 'w-max min-w-full' : 'min-w-full',
        '!overflow-visible',
        resizeEnabled && '[table-layout:fixed]',
      )}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      selectionMode={rowSelectionEnabled ? 'multiple' : undefined}
      selectedKeys={rowSelectionEnabled ? selectedKeys : undefined}
      onSelectionChange={rowSelectionEnabled ? onSelectionChange : undefined}
    >
      {children}
    </DunetaTable.Content>
  );
}
