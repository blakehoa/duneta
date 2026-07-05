import { z } from 'zod';
import type { FieldMessageOptions } from '../types/options.js';

export function isoDateSchema(options: FieldMessageOptions = {}) {
  return z.string().date(options.message ?? 'Invalid date');
}
