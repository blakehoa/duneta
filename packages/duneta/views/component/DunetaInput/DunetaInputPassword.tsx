import { useState } from 'react';
import { DunetaButton } from '../DunetaButton';
import { DunetaInput } from './DunetaInput';
import type { DunetaInputProps } from './types';

// Password input with accessible visibility toggle.
export type DunetaInputPasswordProps = Omit<DunetaInputProps, 'type'> & { showLabel?: string; hideLabel?: string };
export function DunetaInputPassword({ className = '', showLabel = 'Show password', hideLabel = 'Hide password', autoComplete = 'current-password', ...props }: DunetaInputPasswordProps) { const [visible, setVisible] = useState(false); return <div className="relative"><DunetaInput {...props} type={visible ? 'text' : 'password'} autoComplete={autoComplete} className={`${className} pr-10`} /><DunetaButton isIconOnly type="button" size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" aria-label={visible ? hideLabel : showLabel} onPress={() => setVisible((value) => !value)}>{visible ? <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A11.5 11.5 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-5.2 5.8" /><path d="M6.6 6.6A21.8 21.8 0 0 0 1 12s4 7 11 7a11.5 11.5 0 0 0 5.2-1.2" /></svg> : <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>}</DunetaButton></div>; }
