import { z } from 'zod';
import type { PasswordSchemaOptions } from '../types/options.js';
import { DEFAULT_STRONG_PASSWORD } from '../internal/patterns.js';

export function passwordSchema(options: PasswordSchemaOptions = {}) {
  const min = options.min ?? 8;
  const max = options.max ?? 128;
  const label = options.label ?? 'Password';

  let schema = z
    .string()
    .min(min, options.minMessage ?? `${label} must be at least ${min} characters`)
    .max(max, options.maxMessage ?? `${label} must be at most ${max} characters`);

  if (options.strong) {
    schema = schema.regex(
      DEFAULT_STRONG_PASSWORD,
      options.strongMessage ??
        `${label} must include uppercase, lowercase, and a number`,
    );
  }

  if (options.pattern) {
    schema = schema.regex(
      options.pattern,
      options.patternMessage ?? options.message ?? 'Invalid password format',
    );
  }

  return schema;
}

export function strongPasswordSchema(options: PasswordSchemaOptions = {}) {
  return passwordSchema({ ...options, strong: true });
}
