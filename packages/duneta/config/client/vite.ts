import path from 'node:path';
import fs from 'node:fs';
import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig } from 'vite';
import { dunetaWorkerPlugin } from './duneta-worker-plugin.js';

/** Dev: wrangler.jsonc. Prod build/deploy: wrangler.production.jsonc when present. */
export function resolveWranglerConfigPath(repoRoot: string): string {
  const override = process.env.DUNETA_WRANGLER_CONFIG;
  if (override) return path.resolve(repoRoot, override);

  const production = process.env.NODE_ENV === 'production';
  const prodPath = path.resolve(repoRoot, 'wrangler.production.jsonc');
  if (production && fs.existsSync(prodPath)) return prodPath;

  return path.resolve(repoRoot, 'wrangler.jsonc');
}

/**
 * Framework deps pre-bundled at startup. Without this Vite discovers them
 * mid-session, re-optimizes repeatedly and in-flight requests fail with
 * "The file does not exist at node_modules/.vite/deps_ssr/…".
 */
const DUNETA_SHARED_DEPS = [
  'duneta/http/client',
  'duneta/query',
  'duneta/views/component',
  'duneta/views/component/DunetaInput',
  'duneta/views/component/DunetaSelect',
  'duneta/views/providers',
  'dayjs',
  'dayjs/plugin/customParseFormat',
  'dayjs/plugin/duration',
  'dayjs/plugin/timezone',
  'dayjs/plugin/utc',
  '@heroui/react',
  '@tanstack/react-query',
  'lucide-react',
  'react-aria-components',
];

const DUNETA_CLIENT_DEPS = ['duneta/config/client/bootstrap'];

const DUNETA_SSR_DEPS = [
  'duneta/config/server',
  'duneta/http',
  'duneta/http/container',
  'duneta/http/cron',
  'duneta/http/repositories',
  'hono/cookie',
];

export function createDunetaViteConfig(repoRoot: string, appRoot: string, overrides: UserConfig = {}): UserConfig {
  const ssrOptimizeDeps = {
    include: [...DUNETA_SHARED_DEPS, ...DUNETA_SSR_DEPS],
  };

  return defineConfig({
    envDir: repoRoot,
    publicDir: path.resolve(appRoot, 'public'),
    server: {
      port: 8787,
    },
    optimizeDeps: {
      include: [...DUNETA_SHARED_DEPS, ...DUNETA_CLIENT_DEPS],
    },
    plugins: [
      dunetaWorkerPlugin(repoRoot),
      cloudflare({
        configPath: resolveWranglerConfigPath(repoRoot),
        viteEnvironment: { name: 'ssr' },
      }),
      tailwindcss(),
      reactRouter(),
    ],
    resolve: {
      alias: {
        '~': appRoot,
      },
    },
    ssr: {
      noExternal: [/^duneta(\/|$)/, /^@heroui\//],
      optimizeDeps: ssrOptimizeDeps,
    },
    environments: {
      ssr: {
        optimizeDeps: ssrOptimizeDeps,
      },
    },
    css: {
      devSourcemap: false,
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 550,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/components/DunetaDataTable/')) return 'duneta-datatable';

            const herouiComponent = id.match(
              /node_modules\/@heroui\/react\/dist\/components\/([^/]+)/,
            );
            if (herouiComponent) return `heroui-${herouiComponent[1]}`;

            if (!id.includes('node_modules')) return;

            // Shared UI/runtime deps reference each other — one chunk avoids Rollup circular chunk warnings.
            if (
              id.includes('node_modules/@heroui/') ||
              id.includes('node_modules/@tanstack/') ||
              id.includes('node_modules/@react-aria/') ||
              id.includes('node_modules/@react-stately/') ||
              id.includes('node_modules/@internationalized/') ||
              id.includes('node_modules/react-aria-components') ||
              id.includes('node_modules/tailwind-variants') ||
              id.includes('node_modules/@dnd-kit/') ||
              id.includes('node_modules/lucide-react')
            ) {
              return 'vendor-ui';
            }
          },
        },
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.code === 'SOURCEMAP_ERROR' &&
              warning.message.includes("Can't resolve original location"))
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    ...overrides,
  });
}
