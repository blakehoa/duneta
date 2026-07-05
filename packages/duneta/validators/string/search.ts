import type { StringLengthOptions } from '../types/options.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function searchQuerySchema(options: StringLengthOptions = {}) {
  const max = options.max ?? 200;
  return trimmedString().max(
    max,
    options.maxMessage ?? options.message ?? 'Search query is too long',
  );
}
