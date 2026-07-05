
import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, Eye, GripHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../../../../../core/cn.js';
import { DunetaButton } from '../../../DunetaButton';
import { DunetaTooltip } from '../../../DunetaTooltip';
import type { ColumnPanelResetHandlers } from './wrap-reset-handlers';

type ResetTileConfig = {
  key: Exclude<keyof ColumnPanelResetHandlers, 'resetAll'>;
  label: string;
  description: string;
  icon: LucideIcon;
};

const GRANULAR_RESETS: ResetTileConfig[] = [
  {
    key: 'resetWidths',
    label: 'Widths',
    description: 'Restore default column widths',
    icon: ArrowLeftRight,
  },
  {
    key: 'resetOrder',
    label: 'Order',
    description: 'Restore original column order',
    icon: GripHorizontal,
  },
  {
    key: 'resetVisibility',
    label: 'Visibility',
    description: 'Restore default show / hide',
    icon: Eye,
  },
];

function ResetTile({
  label,
  description,
  icon: Icon,
  onPress,
}: Omit<ResetTileConfig, 'key'> & { onPress: () => void }) {
  return (
    <DunetaTooltip closeDelay={0} delay={300}>
      <DunetaButton
        aria-label={description}
        className={cn(
          'h-auto min-h-0 w-full flex-col gap-1 rounded-md px-1 py-1.5',
          'border border-border/70 bg-surface shadow-none',
          'hover:border-default-300 hover:bg-surface-secondary',
        )}
        size="sm"
        variant="secondary"
        onPress={onPress}
      >
        <span className="inline-flex size-5 items-center justify-center rounded bg-default-100 text-foreground">
          <Icon aria-hidden className="size-3" strokeWidth={2} />
        </span>
        <span className="text-[10px] font-medium leading-none">{label}</span>
      </DunetaButton>
      <DunetaTooltip.Content offset={8} placement="top" showArrow>
        <DunetaTooltip.Arrow />
        {description}
      </DunetaTooltip.Content>
    </DunetaTooltip>
  );
}

type DataTableToolbarColumnActionsProps = {
  onReset: ColumnPanelResetHandlers;
};

export function DataTableToolbarColumnActions({
  onReset,
}: DataTableToolbarColumnActionsProps) {
  return (
    <section
      aria-label="Reset column layout"
      className={cn(
        'flex flex-col gap-1.5 rounded-md border border-border/70',
        'bg-surface-tertiary/40 p-2',
      )}
    >
      <DunetaButton
        className="h-7 w-full gap-1.5 text-xs shadow-none"
        size="sm"
        variant="secondary"
        onPress={onReset.resetAll}
      >
        <RotateCcw aria-hidden className="size-3" strokeWidth={2} />
        Reset all
      </DunetaButton>

      <div className="grid grid-cols-3 gap-1.5">
        {GRANULAR_RESETS.map((action) => (
          <ResetTile
            key={action.key}
            description={action.description}
            icon={action.icon}
            label={action.label}
            onPress={onReset[action.key]}
          />
        ))}
      </div>
    </section>
  );
}
