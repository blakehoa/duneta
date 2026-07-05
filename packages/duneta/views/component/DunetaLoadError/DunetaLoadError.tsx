import { DunetaButton } from '../DunetaButton';
import type { DunetaLoadErrorProps } from './types';

export function DunetaLoadError({
  title = 'Unable to load data',
  description = 'Please try again.',
  retryLabel = 'Try again',
  onRetry,
  className = '',
}: DunetaLoadErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-amber-300/30 bg-amber-300/10 p-5 ${className}`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {onRetry ? (
        <DunetaButton className="mt-4" size="sm" variant="primary" onPress={onRetry}>
          {retryLabel}
        </DunetaButton>
      ) : null}
    </div>
  );
}
