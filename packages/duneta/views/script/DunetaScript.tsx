import { useEffect } from 'react';

export type DunetaScriptStrategy = 'afterInteractive' | 'lazyOnload';

export type DunetaScriptProps = {
  id?: string;
  src?: string;
  strategy?: DunetaScriptStrategy;
  children?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: HTMLScriptElement['crossOrigin'];
  integrity?: string;
  nonce?: string;
  onLoad?: () => void;
  onError?: (event: Event) => void;
};

function appendScript({
  async = true,
  children,
  crossOrigin,
  defer,
  id,
  integrity,
  nonce,
  onError,
  onLoad,
  src,
}: DunetaScriptProps) {
  if (id) {
    const existing = document.getElementById(id);
    if (existing instanceof HTMLScriptElement) return existing;
  }

  const script = document.createElement('script');
  if (id) script.id = id;
  if (src) script.src = src;
  if (children) script.text = children;
  if (crossOrigin) script.crossOrigin = crossOrigin;
  if (integrity) script.integrity = integrity;
  if (nonce) script.nonce = nonce;
  script.async = async;
  script.defer = defer ?? false;
  script.addEventListener('load', () => onLoad?.());
  script.addEventListener('error', (event) => onError?.(event));
  document.head.appendChild(script);
  return script;
}

export function DunetaScript({
  async,
  children,
  crossOrigin,
  defer,
  id,
  integrity,
  nonce,
  onError,
  onLoad,
  src,
  strategy = 'afterInteractive',
}: DunetaScriptProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    let script: HTMLScriptElement | undefined;
    let timeout: number | undefined;

    const load = () => {
      script = appendScript({
        async,
        children,
        crossOrigin,
        defer,
        id,
        integrity,
        nonce,
        onError,
        onLoad,
        src,
        strategy,
      });
    };

    if (strategy === 'lazyOnload') {
      const schedule = () => {
        timeout = window.setTimeout(load, 1);
      };
      if (document.readyState === 'complete') {
        schedule();
      } else {
        window.addEventListener('load', schedule, { once: true });
        return () => window.removeEventListener('load', schedule);
      }
    } else {
      load();
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (!id) script?.remove();
    };
  }, [
    async,
    children,
    crossOrigin,
    defer,
    id,
    integrity,
    nonce,
    onError,
    onLoad,
    src,
    strategy,
  ]);

  return null;
}
