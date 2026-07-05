
import { useRef, type ComponentProps } from 'react';
import { DunetaButton } from '../DunetaButton';
import { DunetaFlex } from '../DunetaLayout/DunetaFlex';

export type DunetaUploadProps = Omit<ComponentProps<'input'>, 'className' | 'type'> & {
  label?: string;
  className?: string;
};

export function DunetaUpload({ label = 'Choose file', className = '', ...inputProps }: DunetaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DunetaFlex className={`items-center gap-3 ${className}`}>
      <input ref={inputRef} className="sr-only" type="file" {...inputProps} />
      <DunetaButton variant="secondary" onPress={() => inputRef.current?.click()}>{label}</DunetaButton>
    </DunetaFlex>
  );
}
