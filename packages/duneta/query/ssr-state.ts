import type { DehydratedState } from '@tanstack/react-query';

export const DUNETA_QUERY_STATE_KEY = '__DUNETA_QUERY_STATE__';
export const DUNETA_SSR_QUERY_META = 'dunetaSsr' as const;

declare global {
  interface Window {
    [DUNETA_QUERY_STATE_KEY]?: DehydratedState;
  }
}

export function serializeDehydratedStateScript(state: DehydratedState): string {
  const json = JSON.stringify(state).replace(/</g, '\\u003c');
  return `<script>window.${DUNETA_QUERY_STATE_KEY}=${json}</script>`;
}

export function readClientDehydratedState(): DehydratedState | undefined {
  if (typeof window === 'undefined') return undefined;

  const state = window[DUNETA_QUERY_STATE_KEY];
  if (state) {
    delete window[DUNETA_QUERY_STATE_KEY];
  }

  return state;
}

export function injectScriptBeforeBodyEnd(
  stream: ReadableStream<Uint8Array>,
  script: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let pending = '';

  return stream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        pending += decoder.decode(chunk, { stream: true });
        const bodyEnd = pending.indexOf('</body>');

        if (bodyEnd === -1) {
          return;
        }

        const before = pending.slice(0, bodyEnd);
        const after = pending.slice(bodyEnd);
        controller.enqueue(encoder.encode(`${before}${script}${after}`));
        pending = '';
      },
      flush(controller) {
        if (pending.length > 0) {
          controller.enqueue(encoder.encode(pending));
        }
      },
    }),
  );
}
