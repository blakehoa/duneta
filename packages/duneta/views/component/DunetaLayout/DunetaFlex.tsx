import type { DunetaFlexProps } from './types';

export function DunetaFlex({ children, className = '' }: DunetaFlexProps) {
  return <div className={`flex ${className}`}>{children}</div>;
}
