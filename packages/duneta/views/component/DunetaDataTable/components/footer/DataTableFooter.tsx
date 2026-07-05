
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DunetaLabel } from '../../../DunetaLabel';
import { DunetaPagination } from '../../../DunetaPagination';
import { DunetaTable } from '../../../DunetaTable';
import type { DunetaDataTablePaginationConfig } from '../../types';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30];

type DataTableFooterProps = {
  pagination: DunetaDataTablePaginationConfig & { total: number };
};

export function DataTableFooter({ pagination }: DataTableFooterProps) {
  const {
    total,
    pageSize,
    page,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    onPageChange,
    onPageSizeChange,
  } = pagination;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <DunetaTable.Footer>
      <DunetaPagination size="sm">
        <DunetaPagination.Summary>
          {start} to {end} of {total} results
        </DunetaPagination.Summary>
        {onPageSizeChange ? (
          <DunetaLabel className="flex items-center gap-2 text-sm text-muted">
            <span>Rows</span>
            <select
              className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </DunetaLabel>
        ) : null}
        <DunetaPagination.Content>
          <DunetaPagination.Item>
            <DunetaPagination.Previous
              isDisabled={page <= 1}
              onPress={() => onPageChange?.(Math.max(1, page - 1))}
            >
              <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
            </DunetaPagination.Previous>
          </DunetaPagination.Item>
          {pages.map((pageNumber) => (
            <DunetaPagination.Item key={pageNumber}>
              <DunetaPagination.Link
                isActive={pageNumber === page}
                onPress={() => onPageChange?.(pageNumber)}
              >
                {pageNumber}
              </DunetaPagination.Link>
            </DunetaPagination.Item>
          ))}
          <DunetaPagination.Item>
            <DunetaPagination.Next
              isDisabled={page >= pageCount}
              onPress={() => onPageChange?.(Math.min(pageCount, page + 1))}
            >
              <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
            </DunetaPagination.Next>
          </DunetaPagination.Item>
        </DunetaPagination.Content>
      </DunetaPagination>
    </DunetaTable.Footer>
  );
}
