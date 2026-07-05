import type { DunetaLayoutSectionHeaderProps } from './types';

export function DunetaLayoutHeader({ children, className = '' }: DunetaLayoutSectionHeaderProps) {
  return <header className={`flex min-w-0 items-center justify-between gap-3 ${className}`}>{children}</header>;
}
