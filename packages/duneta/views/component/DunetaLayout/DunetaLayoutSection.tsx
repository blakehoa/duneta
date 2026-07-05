import type { DunetaLayoutSectionProps } from './types';
import { DunetaLayoutActions } from './DunetaLayoutActions';
import { DunetaLayoutGrid } from './DunetaLayoutGrid';
import { DunetaLayoutHeader } from './DunetaLayoutHeader';

function Root({ children, className = '' }: DunetaLayoutSectionProps) {
  return <section className={`flex min-w-0 flex-col gap-4 md:gap-6 ${className}`}>{children}</section>;
}

export const DunetaLayoutSection = Object.assign(Root, {
  Header: DunetaLayoutHeader,
  Actions: DunetaLayoutActions,
  Grid: DunetaLayoutGrid,
});
