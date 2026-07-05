import { z } from 'zod';
import type { FieldMessageOptions } from '../types/options.js';

export function acceptedTermsSchema(options: FieldMessageOptions = {}) {
  return z.literal(true, {
    errorMap: () => ({ message: options.message ?? 'You must accept the terms' }),
  });
}
