export function mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  const abort = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      abort();
      break;
    }
    signal.addEventListener('abort', abort, { once: true });
  }

  return controller.signal;
}

export function createRequestSignal(
  timeoutMs?: number,
  userSignal?: AbortSignal | null,
): { signal?: AbortSignal; cleanup: () => void } {
  const cleanups: Array<() => void> = [];
  const signals: AbortSignal[] = [];

  if (userSignal) signals.push(userSignal);

  if (timeoutMs !== undefined) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    cleanups.push(() => clearTimeout(timeoutId));
    signals.push(controller.signal);
  }

  if (signals.length === 0) {
    return { signal: undefined, cleanup: () => {} };
  }

  if (signals.length === 1) {
    return { signal: signals[0], cleanup: () => cleanups.forEach((fn) => fn()) };
  }

  return {
    signal: mergeAbortSignals(signals),
    cleanup: () => cleanups.forEach((fn) => fn()),
  };
}
