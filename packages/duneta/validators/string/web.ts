import type { FieldMessageOptions, RegexStringOptions } from '../types/options.js';
import { DEFAULT_HEX_COLOR, DEFAULT_PHONE, DEFAULT_SLUG } from '../internal/patterns.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function phoneSchema(options: RegexStringOptions = {}) {
  return trimmedString().regex(
    options.pattern ?? DEFAULT_PHONE,
    options.patternMessage ?? options.message ?? 'Invalid phone number',
  );
}

export function urlSchema(options: FieldMessageOptions = {}) {
  return trimmedString().url(options.message ?? 'Invalid URL');
}

export function slugSchema(options: RegexStringOptions = {}) {
  return trimmedString().regex(
    options.pattern ?? DEFAULT_SLUG,
    options.patternMessage ?? options.message ?? 'Invalid slug',
  );
}

export function hexColorSchema(options: RegexStringOptions = {}) {
  return trimmedString().regex(
    options.pattern ?? DEFAULT_HEX_COLOR,
    options.patternMessage ?? options.message ?? 'Invalid color',
  );
}
