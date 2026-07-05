import { DunetaInput } from './DunetaInput';
import type { DunetaInputProps } from './types';

// Email-specialized input.

export type DunetaInputEmailProps = Omit<DunetaInputProps, 'type' | 'autoComplete'>;

export function DunetaInputEmail(props: DunetaInputEmailProps) {
  return <DunetaInput {...props} type="email" autoComplete="email" />;
}
