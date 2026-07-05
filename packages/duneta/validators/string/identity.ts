import type { RegexStringOptions, StringLengthOptions } from '../types/options.js';
import { DEFAULT_USERNAME } from '../internal/patterns.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function usernameSchema(options: RegexStringOptions = {}) {
  const min = options.min ?? 3;
  const max = options.max ?? 32;

  return trimmedString()
    .min(min, options.minMessage ?? `Username must be at least ${min} characters`)
    .max(max, options.maxMessage ?? `Username must be at most ${max} characters`)
    .regex(
      options.pattern ?? DEFAULT_USERNAME,
      options.patternMessage ??
        options.message ??
        'Username can only contain letters, numbers, and underscores',
    );
}

export function displayNameSchema(options: StringLengthOptions = {}) {
  const label = options.label ?? 'Name';
  const min = options.min ?? 1;
  const max = options.max ?? 120;

  return trimmedString()
    .min(min, options.minMessage ?? `${label} is required`)
    .max(max, options.maxMessage ?? `${label} must be at most ${max} characters`);
}
