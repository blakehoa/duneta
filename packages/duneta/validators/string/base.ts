import type {
  FieldMessageOptions,
  RegexStringOptions,
  StringLengthOptions,
} from '../types/options.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function requiredString(options: FieldMessageOptions = {}) {
  const label = options.label ?? 'Field';
  return trimmedString().min(1, options.message ?? `${label} is required`);
}

export function optionalTrimmedString(options: StringLengthOptions = {}) {
  let schema = trimmedString();
  if (options.max !== undefined) {
    schema = schema.max(options.max, options.maxMessage ?? options.message ?? 'Value is too long');
  }
  return schema.transform((value) => value || undefined).optional();
}

export function regexString(options: RegexStringOptions & { pattern: RegExp }) {
  let schema = trimmedString();

  if (options.min !== undefined) {
    schema = schema.min(
      options.min,
      options.minMessage ?? options.message ?? `Must be at least ${options.min} characters`,
    );
  }

  if (options.max !== undefined) {
    schema = schema.max(
      options.max,
      options.maxMessage ?? options.message ?? `Must be at most ${options.max} characters`,
    );
  }

  return schema.regex(
    options.pattern,
    options.patternMessage ?? options.message ?? 'Invalid format',
  );
}
