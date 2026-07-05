import { z } from 'zod';
import type { FieldMessageOptions } from '../types/options.js';

export function uuidSchema(options: FieldMessageOptions = {}) {
  return z.string().uuid(options.message ?? 'Invalid ID');
}
