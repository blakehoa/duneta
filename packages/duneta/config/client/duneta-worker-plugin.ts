import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const SERVER_CONFIG_VIRTUAL = 'virtual:duneta/server-config';
const SERVER_CONFIG_SPEC = './config/server';

/** Public path keys → default module spec (project-root relative). */
export const DUNETA_WORKER_DEFAULTS = {
  routes: './routes/api',
  services: './app/providers/app-service-provider',
  cron: './routes/console',
  permissions: './app/providers/app-service-provider',
} as const;

type WorkerPathKey = keyof typeof DUNETA_WORKER_DEFAULTS;

function isWorkerPathKey(key: string): key is WorkerPathKey {
  return Object.hasOwn(DUNETA_WORKER_DEFAULTS, key);
}

function resolveModuleSpec(repoRoot: string, spec: string): string | null {
  const normalized = spec.replace(/\\/g, '/').replace(/\.(ts|tsx|js|mjs|cjs)$/, '');
  const candidates = [
    `${normalized}.ts`,
    `${normalized}.tsx`,
    `${normalized}.js`,
    `${normalized}/index.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.js`,
  ];

  for (const candidate of candidates) {
    const abs = path.resolve(repoRoot, candidate);
    if (fs.existsSync(abs)) {
      const rel = path.relative(repoRoot, abs).replace(/\\/g, '/');
      return rel.startsWith('.') ? rel : `./${rel}`;
    }
  }

  return null;
}

function parsePathOptions(body: string): Partial<Record<WorkerPathKey, string>> {
  const options: Partial<Record<WorkerPathKey, string>> = {};

  for (const match of body.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*['"]([^'"]+)['"]/g)) {
    if (isWorkerPathKey(match[1])) options[match[1]] = match[2];
  }

  return options;
}

function buildResolvedOptions(
  repoRoot: string,
  overrides: Partial<Record<WorkerPathKey, string>>,
): string {
  const entries: string[] = [];

  for (const key of Object.keys(DUNETA_WORKER_DEFAULTS) as WorkerPathKey[]) {
    const resolved = resolveModuleSpec(repoRoot, overrides[key] ?? DUNETA_WORKER_DEFAULTS[key]);
    if (!resolved) continue;
    entries.push(`${key}: () => import(${JSON.stringify(resolved)})`);
  }

  return `{ ${entries.join(', ')} }`;
}

/**
 * - Rewrites `createDunetaWorker({ routes: '...' })` into `() => import(...)` loaders.
 * - Resolves `virtual:duneta/server-config` → `./config/server.ts` (or `.js`).
 */
export function dunetaWorkerPlugin(repoRoot: string): Plugin {
  return {
    name: 'duneta-worker-paths',
    enforce: 'pre',
    resolveId(id) {
      if (id === SERVER_CONFIG_VIRTUAL) return id;
    },
    load(id) {
      if (id !== SERVER_CONFIG_VIRTUAL) return null;

      const resolved = resolveModuleSpec(repoRoot, SERVER_CONFIG_SPEC);
      if (!resolved) {
        throw new Error(
          `[duneta] missing ${SERVER_CONFIG_SPEC}.ts (or .js) at the project root`,
        );
      }

      const rooted = `/${resolved.replace(/^\.\//, '')}`;
      return `export { default } from ${JSON.stringify(rooted)};\n`;
    },
    transform(code, id) {
      const file = id.split('?')[0];
      if (!/(^|\/)worker\.(m|c)?(t|j)sx?$/.test(file)) return null;
      if (!code.includes('createDunetaWorker')) return null;

      let next = code;
      let touched = false;

      next = next.replace(/createDunetaWorker\s*\(\s*\)/g, () => {
        touched = true;
        return `createDunetaWorker(${buildResolvedOptions(repoRoot, {})})`;
      });

      next = next.replace(/createDunetaWorker\s*\(\s*\{([\s\S]*?)\}\s*\)/g, (_full, body: string) => {
        if (/\(\s*\)\s*=>\s*import\s*\(/.test(body)) return _full;

        touched = true;
        const overrides = parsePathOptions(body);
        return `createDunetaWorker(${buildResolvedOptions(repoRoot, overrides)})`;
      });

      return touched ? next : null;
    },
  };
}
