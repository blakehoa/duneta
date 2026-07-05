
import type { ReactNode } from 'react';
import { DunetaButton } from '../../../DunetaButton';

type ToolbarActionButtonProps = {
  label: string;
  icon: ReactNode;
  activeCount?: number;
};

export function ToolbarActionButton({
  label,
  icon,
  activeCount,
}: ToolbarActionButtonProps) {
  return (
    <DunetaButton size="sm" variant="secondary" className="gap-1.5">
      {icon}
      <span>{label}</span>
      {activeCount != null && activeCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
          {activeCount}
        </span>
      ) : null}
    </DunetaButton>
  );
}
