
import { Filter } from 'lucide-react';
import { DunetaTypography } from '../../../DunetaTypography';
import type { DunetaDataTableToolbarFilterConfig } from '../../types/toolbar';
import { DataTableToolbarPanel } from './DataTableToolbarPanel';
import { ToolbarActionButton } from './ToolbarActionButton';

type DataTableToolbarFilterProps = {
  config: DunetaDataTableToolbarFilterConfig;
};

export function DataTableToolbarFilter({ config }: DataTableToolbarFilterProps) {
  return (
    <DataTableToolbarPanel
      title="Filter"
      trigger={
        <ToolbarActionButton
          label="Filter"
          icon={<Filter aria-hidden className="size-4" strokeWidth={2} />}
          activeCount={config.activeCount}
        />
      }
      onApply={config.onApply}
    >
      <div className="px-3 py-3">
        {config.children ?? (
          <DunetaTypography.Paragraph className="text-sm text-muted">
            No filters applied. Pass{' '}
            <DunetaTypography.Code>toolbar.filter.children</DunetaTypography.Code>{' '}
            and{' '}
            <DunetaTypography.Code>toolbar.filter.onApply</DunetaTypography.Code>{' '}
            for a custom filter panel.
          </DunetaTypography.Paragraph>
        )}
      </div>
    </DataTableToolbarPanel>
  );
}
