import { z } from 'zod';
import type { FieldMessageOptions } from '../types/options.js';
import { trimmedString } from '../internal/trimmed-string.js';

export function emailSchema(options: FieldMessageOptions = {}) {
  return trimmedString().email(options.message ?? 'Invalid email address');
}

export function optionalEmailSchema(options: FieldMessageOptions = {}) {
  return z.union([emailSchema(options), z.literal('')]);
}
