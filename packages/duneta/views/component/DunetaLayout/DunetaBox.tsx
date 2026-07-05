import type { DunetaBoxProps } from './types';

export function DunetaBox({ children, className = '' }: DunetaBoxProps) {
  return <div className={className}>{children}</div>;
}
