import type { DunetaLayoutSectionActionsProps } from './types';

export function DunetaLayoutActions({ children, className = '' }: DunetaLayoutSectionActionsProps) {
  return <div className={`ml-auto flex flex-wrap items-center justify-end gap-2 ${className}`}>{children}</div>;
}
