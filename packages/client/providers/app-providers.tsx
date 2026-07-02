import type { ReactNode } from 'react';
import { DunetaQueryProvider } from './query-provider.js';
import { DunetaThemeProvider } from './theme-provider.js';
import { QueryClient } from '@tanstack/react-query';
import { DunetaThemeMode } from '../configs/types.js';

export type DunetaAppProvidersProps = {
  children: ReactNode;
  theme: DunetaThemeMode;
  queryClient?: QueryClient;
};

/** Default app provider stack kept intentionally minimal. */
export function DunetaAppProviders({
  children,
  theme = 'light',
  queryClient,
}: DunetaAppProvidersProps) {
  return (
    <DunetaThemeProvider defaultTheme={theme}>
      <DunetaQueryProvider client={queryClient}>{children}</DunetaQueryProvider>
    </DunetaThemeProvider>
  );
}
