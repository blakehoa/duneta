import type { PropsWithChildren } from 'react';
// Layout section for related form controls.
export type DunetaFormSectionProps = PropsWithChildren<{ className?: string; layout?: 'horizontal' | 'vertical' }>;
export function DunetaFormSection({ children, className = '', layout = 'vertical' }: DunetaFormSectionProps) { return <div className={`flex min-w-0 ${layout === 'horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-col gap-3'} ${className}`}>{children}</div>; }
