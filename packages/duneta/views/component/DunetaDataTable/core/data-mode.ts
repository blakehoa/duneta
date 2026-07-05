import type {
  DunetaDataTableDataType,
  DunetaDataTablePaginationConfig,
} from '../types';

export function isDynamicDataType(
  dataType: DunetaDataTableDataType | undefined,
): boolean {
  return dataType !== 'static';
}

export function resolveFooterPagination(
  dataType: DunetaDataTableDataType | undefined,
  dataLength: number,
  pagination: DunetaDataTablePaginationConfig,
): DunetaDataTablePaginationConfig & { total: number } {
  const total = isDynamicDataType(dataType)
    ? (pagination.total ?? dataLength)
    : dataLength;

  return { ...pagination, total };
}
