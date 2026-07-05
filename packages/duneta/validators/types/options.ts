export type FieldMessageOptions = {
  label?: string;
  message?: string;
};

export type StringLengthOptions = FieldMessageOptions & {
  min?: number;
  max?: number;
  minMessage?: string;
  maxMessage?: string;
};

export type RegexStringOptions = StringLengthOptions & {
  pattern?: RegExp;
  patternMessage?: string;
};

export type PasswordSchemaOptions = StringLengthOptions & {
  strong?: boolean;
  pattern?: RegExp;
  strongMessage?: string;
  patternMessage?: string;
};

export type OtpSchemaOptions = {
  minLength?: number;
  maxLength?: number;
  message?: string;
};

export type PaginationSchemaOptions = {
  min?: number;
  max?: number;
  defaultValue?: number;
  message?: string;
};

export type PasswordsMatchOptions = {
  passwordKey?: string;
  confirmKey?: string;
  message?: string;
};
