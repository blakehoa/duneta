import { DunetaInput } from './DunetaInput';
import type { DunetaInputProps } from './types';

// Phone-specialized input.

export type DunetaInputPhoneProps = Omit<DunetaInputProps, 'type' | 'inputMode' | 'autoComplete'>;

export function DunetaInputPhone(props: DunetaInputPhoneProps) {
  return <DunetaInput {...props} type="tel" inputMode="tel" autoComplete="tel" />;
}
