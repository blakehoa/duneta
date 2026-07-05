import { useCallback, useState } from 'react';
import { getDefaultLocale, getSupportedLocales, type DunetaLocale } from './config.js';
import { resolveClientLocale, setClientLocale } from './locale.js';

export function useLocale() {
  const [locale, setLocaleState] = useState<DunetaLocale>(() => resolveClientLocale());

  const setLocale = useCallback((next: DunetaLocale) => {
    setClientLocale(next);
    setLocaleState(next);
  }, []);

  return {
    locale,
    setLocale,
    supportedLocales: getSupportedLocales(),
    defaultLocale: getDefaultLocale(),
  };
}
