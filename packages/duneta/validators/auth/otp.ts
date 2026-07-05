import type { OtpSchemaOptions } from '../types/options.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function otpSchema(options: OtpSchemaOptions = {}) {
  const minLength = options.minLength ?? 4;
  const maxLength = options.maxLength ?? 8;
  const pattern = new RegExp(`^\\d{${minLength},${maxLength}}$`);

  return trimmedString().regex(
    pattern,
    options.message ?? 'Invalid verification code',
  );
}
