import type { DunetaThemeMode } from '../configs/types.js';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';

export type DunetaThemeProviderProps = PropsWithChildren<{
  defaultTheme: DunetaThemeMode;
}>;

/** Client-only theme context (`useTheme`) + initial theme script via next-themes. */
export function DunetaThemeProvider({
  children,
  defaultTheme,
}: DunetaThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme === 'system' ? 'system' : defaultTheme}
      enableSystem={defaultTheme === 'system'}
    >
      {children}
    </NextThemesProvider>
  );
}
