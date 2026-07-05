
import type { ReactNode } from 'react';
import { cn } from '../../../../core/cn.js';
import {
  TABLE_RESIZABLE_CONTAINER_CLASS,
  TABLE_ROOT_OVERFLOW_CLASS,
  TABLE_SCROLL_CONTAINER_CLASS,
  TABLE_SHELL_RADIUS_CLASS,
} from '../constants';
import { resolveTableScrollMaxHeight } from '../core/table';
import { DunetaTable } from '../../DunetaTable';
import type { DunetaTableProps } from '../../DunetaTable/types';

type DataTableRootProps = {
  className?: string;
  variant?: DunetaTableProps['variant'];
  bodyMaxHeight: number | string;
  virtualEnabled: boolean;
  resizeEnabled: boolean;
  shrinkWrapColumns?: boolean;
  children: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
};

export function DataTableRoot({
  className,
  variant = 'secondary',
  bodyMaxHeight,
  virtualEnabled,
  resizeEnabled,
  shrinkWrapColumns,
  children,
  toolbar,
  footer,
}: DataTableRootProps) {
  const scrollMaxHeight = virtualEnabled
    ? bodyMaxHeight
    : resolveTableScrollMaxHeight(bodyMaxHeight);

  const scrollShellProps = {
    style: { maxHeight: scrollMaxHeight },
  };

  const scrollBody =
    shrinkWrapColumns ? (
      <div className="w-max min-w-full">{children}</div>
    ) : (
      children
    );

  const tableContent = resizeEnabled ? (
    <DunetaTable.ResizableContainer
      {...scrollShellProps}
      className={TABLE_RESIZABLE_CONTAINER_CLASS}
    >
      {scrollBody}
    </DunetaTable.ResizableContainer>
  ) : (
    <DunetaTable.ScrollContainer
      {...scrollShellProps}
      className={TABLE_SCROLL_CONTAINER_CLASS}
    >
      {scrollBody}
    </DunetaTable.ScrollContainer>
  );

  return (
    <DunetaTable
      variant={variant}
      className={cn(
        'border border-border',
        TABLE_SHELL_RADIUS_CLASS,
        TABLE_ROOT_OVERFLOW_CLASS,
        className,
      )}
    >
      {toolbar}
      {tableContent}
      {footer}
    </DunetaTable>
  );
}
