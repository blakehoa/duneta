import { z } from 'zod';
import type { PasswordsMatchOptions } from '../types/options.js';

export function passwordsMatch(options: PasswordsMatchOptions = {}) {
  const passwordKey = options.passwordKey ?? 'password';
  const confirmKey = options.confirmKey ?? 'confirmPassword';
  const message = options.message ?? 'Passwords do not match';

  return (values: Record<string, unknown>, ctx: z.RefinementCtx) => {
    if (values[passwordKey] !== values[confirmKey]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [confirmKey],
      });
    }
  };
}
