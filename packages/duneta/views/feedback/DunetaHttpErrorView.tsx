import { HttpError } from '../../http/client/errors.js';
import { DunetaLoadError } from '../component/DunetaLoadError/DunetaLoadError.js';
import type { DunetaLoadErrorProps } from '../component/DunetaLoadError/types.js';

export type DunetaHttpErrorViewProps = Omit<DunetaLoadErrorProps, 'description'> & {
  error: unknown;
  fallbackDescription?: string;
};

export function resolveHttpErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof HttpError) {
    if (error.body && typeof error.body === 'object') {
      const body = error.body as { error?: string; message?: string };
      return body.error ?? body.message ?? error.message;
    }

    if (typeof error.body === 'string' && error.body.length > 0) {
      return error.body;
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

export function DunetaHttpErrorView({
  error,
  fallbackDescription = 'Something went wrong',
  ...props
}: DunetaHttpErrorViewProps) {
  return (
    <DunetaLoadError
      {...props}
      description={resolveHttpErrorMessage(error, fallbackDescription)}
    />
  );
}
