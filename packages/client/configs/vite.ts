import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig } from 'vite';

function resolveDunetaRoots() {
  const require = createRequire(import.meta.url);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const workspaceClient = path.join(here, '../../package.json');
  const workspaceServer = path.join(here, '../../../server/package.json');
  if (fs.existsSync(workspaceClient) && fs.existsSync(workspaceServer)) {
    return {
      clientRoot: path.dirname(workspaceClient),
      serverRoot: path.dirname(workspaceServer),
    };
  }

  try {
    const dunetaPkg = require.resolve('duneta/package.json');
    const root = path.dirname(dunetaPkg);
    const client = path.join(root, 'client', 'package.json');
    const server = path.join(root, 'server', 'package.json');
    if (fs.existsSync(client) && fs.existsSync(server)) {
      return {
        clientRoot: path.dirname(client),
        serverRoot: path.dirname(server),
      };
    }
  } catch {
    // fall through
  }

  try {
    return {
      clientRoot: path.dirname(require.resolve('duneta-client/package.json')),
      serverRoot: path.dirname(require.resolve('duneta-server/package.json')),
    };
  } catch {
    throw new Error('[duneta] Install duneta, or duneta-client and duneta-server');
  }
}

const { clientRoot, serverRoot } = resolveDunetaRoots();

export function createDunetaViteConfig(repoRoot: string, appRoot: string, overrides: UserConfig = {}): UserConfig {
  return defineConfig({
    envDir: repoRoot,
    publicDir: path.resolve(appRoot, 'public'),
    server: {
      port: 8787,
    },
    plugins: [
      cloudflare({
        configPath: path.resolve(repoRoot, 'wrangler.jsonc'),
        viteEnvironment: { name: 'ssr' },
      }),
      tailwindcss(),
      reactRouter(),
    ],
    resolve: {
      alias: {
        '~': appRoot,
        'duneta/client': clientRoot,
        'duneta/server': serverRoot,
      },
    },
    ssr: {
      noExternal: [/^duneta\/client/, /^duneta\/server/, /^@heroui\//],
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
