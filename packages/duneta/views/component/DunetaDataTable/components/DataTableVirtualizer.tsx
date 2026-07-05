
import { TableLayout, Virtualizer } from '@heroui/react';
import type { ReactNode } from 'react';
import {
  TABLE_HEADER_HEIGHT,
  TABLE_ROW_HEIGHT,
} from '../constants';

type DataTableVirtualizerProps = {
  enabled: boolean;
  children: ReactNode;
};

export function DataTableVirtualizer({
  enabled,
  children,
}: DataTableVirtualizerProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        headingHeight: TABLE_HEADER_HEIGHT,
        rowHeight: TABLE_ROW_HEIGHT,
      }}
    >
      {children}
    </Virtualizer>
  );
}
