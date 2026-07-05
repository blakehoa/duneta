import { z } from 'zod';
import type { PaginationSchemaOptions } from '../types/options.js';

export function paginationPageSchema(options: PaginationSchemaOptions = {}) {
  const min = options.min ?? 1;
  return z.coerce
    .number()
    .int(options.message ?? 'Page must be an integer')
    .min(min, options.message ?? `Page must be at least ${min}`)
    .default(options.defaultValue ?? 1);
}

export function paginationLimitSchema(options: PaginationSchemaOptions = {}) {
  const min = options.min ?? 1;
  const max = options.max ?? 100;
  return z.coerce
    .number()
    .int(options.message ?? 'Limit must be an integer')
    .min(min, options.message ?? `Limit must be at least ${min}`)
    .max(max, options.message ?? `Limit must be at most ${max}`)
    .default(options.defaultValue ?? 20);
}
