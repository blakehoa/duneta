import { z } from 'zod';
import type { FieldMessageOptions } from '../types/options.js';

export function positiveIntSchema(options: FieldMessageOptions = {}) {
  return z.coerce
    .number()
    .int(options.message ?? 'Must be an integer')
    .positive(options.message ?? 'Must be greater than 0');
}

export function nonNegativeIntSchema(options: FieldMessageOptions = {}) {
  return z.coerce
    .number()
    .int(options.message ?? 'Must be an integer')
    .nonnegative(options.message ?? 'Must be 0 or greater');
}
