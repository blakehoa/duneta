import { Description, FieldError, Label, TextField } from '@heroui/react';
import type { TextFieldProps } from '@heroui/react';
import type { ReactNode } from 'react';

// Text-field composition for labels, descriptions and errors.

export type DunetaFormFieldProps = Omit<TextFieldProps, 'children'> & {
  label: ReactNode; children: ReactNode; description?: ReactNode; error?: string; labelClassName?: string;
};

export function DunetaFormField({ label, children, description, error, isInvalid, className, labelClassName = '', ...props }: DunetaFormFieldProps) {
  return <TextField {...props} className={className} fullWidth isInvalid={isInvalid ?? Boolean(error)}><Label className={`pb-1.5 text-sm font-medium ${labelClassName}`}>{label}</Label>{children}{description ? <Description className="text-xs text-slate-500">{description}</Description> : null}{error ? <FieldError>{error}</FieldError> : null}</TextField>;
}
