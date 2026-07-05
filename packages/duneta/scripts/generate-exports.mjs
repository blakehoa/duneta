import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dunetaDir = fileURLToPath(new URL('..', import.meta.url));

/**
 * Source of truth for the public `duneta/*` import surface.
 * Export path === folder path under `packages/duneta/` (mechanical, no aliasing).
 * Each entry is `[exportPath, distEntry]`, both relative (no leading `./`).
 */
const MODULE_EXPORTS = [
  // ── shared / framework-agnostic ────────────────────────────────────────────
  ['core', 'core/index'],
  ['config/client', 'config/client/index'],
  ['config/client/react-router', 'config/client/react-router'],
  ['config/client/load', 'config/client/load'],
  ['config/client/bootstrap', 'config/client/bootstrap'],
  ['config/server', 'config/server/index'],
  ['helpers', 'helpers/index'],
  ['i18n', 'i18n/index'],
  ['query', 'query/index'],
  ['query/ssr-server', 'query/ssr-server'],
  ['validators', 'validators/index'],
  ['validators/string', 'validators/string/index'],
  ['validators/number', 'validators/number/index'],
  ['validators/auth', 'validators/auth/index'],
  ['validators/scalar', 'validators/scalar/index'],
  ['validators/types', 'validators/types/index'],
  // ── client — React DOM layer (views/) ──────────────────────────────────────
  ['views/component', 'views/component/index'],
  ['views/feedback', 'views/feedback/index'],
  ['views/form', 'views/form/index'],
  ['views/image', 'views/image/index'],
  ['views/providers', 'views/providers/index'],
  ['views/router', 'views/router/index'],
  ['views/script', 'views/script/index'],
  // ── middleware (explicit request targets) ──────────────────────────────────
  ['middleware/page', 'middleware/page/index'],
  ['middleware/http', 'middleware/http/index'],
  // ── server — auth / permission ─────────────────────────────────────────────
  ['auth', 'auth/index'],
  ['permission', 'permission/index'],
  // ── server — HTTP / Hono layer ─────────────────────────────────────────────
  ['http', 'http/index'],
  ['http/client', 'http/client/index'],
  ['http/cache', 'http/cache/index'],
  ['http/container', 'http/container/index'],
  ['http/cron', 'http/cron/index'],
  ['http/database', 'http/database/index'],
  ['http/logging', 'http/logging/index'],
  ['http/repositories', 'http/repositories/index'],
  ['http/router', 'http/router/index'],
  // ── runtime ───────────────────────────────────────────────────────────────
  ['worker', 'worker/index'],
  ['starter/layouts', 'starter/layouts/index'],
];

/** Wildcard exports — one dist folder per matched name. */
const WILDCARD_EXPORTS = [
  ['views/component/*', 'views/component/*/index'],
];

/** Static assets served straight from source, not from dist/. */
const ASSET_EXPORTS = [
  ['starter/layouts/duneta-home.css', 'starter/layouts/duneta-home.css'],
  ['views/theme/globals.css', 'views/theme/globals.css'],
];

/** .mjs scripts consumed directly by the CLI, not compiled. */
const SCRIPT_EXPORTS = [
  ['scripts/sync-routers', 'scripts/sync-routers.mjs'],
  ['scripts/load-config', 'scripts/load-config.mjs'],
];

function moduleEntry(distEntry) {
  return {
    types: `./dist/${distEntry}.d.ts`,
    import: `./dist/${distEntry}.js`,
  };
}

function wildcardEntry(distPattern) {
  return {
    types: `./dist/${distPattern}.d.ts`,
    import: `./dist/${distPattern}.js`,
  };
}

const exportsMap = {
  './package.json': './package.json',
  './vite': './vite.mjs',
};

for (const [exportPath, distEntry] of MODULE_EXPORTS) {
  exportsMap[`./${exportPath}`] = moduleEntry(distEntry);
}
for (const [exportPath, distPattern] of WILDCARD_EXPORTS) {
  exportsMap[`./${exportPath}`] = wildcardEntry(distPattern);
}
for (const [exportPath, assetPath] of ASSET_EXPORTS) {
  exportsMap[`./${exportPath}`] = `./${assetPath}`;
}
for (const [exportPath, scriptPath] of SCRIPT_EXPORTS) {
  exportsMap[`./${exportPath}`] = `./${scriptPath}`;
}

const dunetaPkgPath = path.join(dunetaDir, 'package.json');
const dunetaPkg = JSON.parse(fs.readFileSync(dunetaPkgPath, 'utf8'));
dunetaPkg.exports = exportsMap;
fs.writeFileSync(dunetaPkgPath, `${JSON.stringify(dunetaPkg, null, 2)}\n`);

// Warn (don't fail) if dist/ is built and a manifest entry has gone stale.
const distDir = path.join(dunetaDir, 'dist');
if (fs.existsSync(distDir)) {
  for (const [exportPath, distEntry] of MODULE_EXPORTS) {
    const jsFile = path.join(distDir, `${distEntry}.js`);
    if (!fs.existsSync(jsFile)) {
      console.warn(`[generate-exports] missing dist file for "./${exportPath}": ${path.relative(dunetaDir, jsFile)}`);
    }
  }
}
