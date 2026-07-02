#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs, { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveDunetaRoots } from '../scripts/resolve-roots.mjs';

const require = createRequire(import.meta.url);
const dunetaRoot = path.dirname(fileURLToPath(new URL('../', import.meta.url)));
const { clientRoot, serverRoot } = resolveDunetaRoots(import.meta.url);
const projectRoot = process.cwd();
const appRoot = path.join(projectRoot, 'app');

function bin(pkg, file = 'bin.cjs') {
  return path.join(path.dirname(require.resolve(`${pkg}/package.json`)), file);
}

function wrangler() {
  return path.join(path.dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js');
}

function run(cmd, args, cwd = projectRoot) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd, env: process.env });
  if (r.error || r.status !== 0) process.exit(r.status ?? 1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeNewFile(file, content) {
  if (existsSync(file)) {
    console.error(`[duneta] ${path.relative(projectRoot, file)} already exists`);
    process.exit(1);
  }
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
  console.log(`[duneta] created ${path.relative(projectRoot, file)}`);
}

function writeFile(file, content) {
  fs.writeFileSync(file, content);
  console.log(`[duneta] updated ${path.relative(projectRoot, file)}`);
}

function words(input) {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
}

function kebab(input) {
  return words(input)
    .map((part) => part.toLowerCase())
    .join('-');
}

function pascal(input) {
  return words(input)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function camel(input) {
  const name = pascal(input);
  return name[0].toLowerCase() + name.slice(1);
}

function requireName(command, rest) {
  const name = rest.find((arg) => !arg.startsWith('-'));
  if (!name) {
    console.error(`[duneta] usage: duneta ${command} <name>`);
    process.exit(1);
  }
  return name;
}

function routePathFromName(name) {
  const routePath = kebab(name);
  return routePath.startsWith('/') ? routePath : `/${routePath}`;
}

function makePage(name) {
  const dir = path.join(appRoot, 'pages', kebab(name));
  const component = `${pascal(name)}Page`;
  writeNewFile(
    path.join(dir, 'page.tsx'),
    `export function meta() {
  return [{ title: '${pascal(name)} - Duneta' }];
}

export default function ${component}() {
  return <h1>${pascal(name)}</h1>;
}
`,
  );
}

function makeController(name) {
  const base = kebab(name);
  const className = `${pascal(name)}Controller`;
  writeNewFile(
    path.join(appRoot, 'api/controllers', `${base}-controller.ts`),
    `import type { Context } from 'hono';
import { BaseController } from 'duneta/server/http';
import type { RequestContext } from 'duneta/server/middlewares';

export class ${className} extends BaseController {
  index = (c: Context<RequestContext>) => {
    return this.json(c, { data: [] });
  };

  show = (c: Context<RequestContext>) => {
    return this.json(c, { data: { id: c.req.param('id') } });
  };
}
`,
  );
}

function makeRepository(name) {
  const base = kebab(name);
  const className = `${pascal(name)}Repository`;
  writeNewFile(
    path.join(appRoot, 'api/repositories', `${base}-repository.ts`),
    `export class ${className} {
  all() {
    return [];
  }
}
`,
  );
}

function makeRoute(name) {
  const base = kebab(name);
  const controller = `${pascal(name)}Controller`;
  const exportName = `${camel(name)}Routes`;
  writeNewFile(
    path.join(appRoot, 'api/routers', `${base}.routes.ts`),
    `import { resolveController } from 'duneta/server/http';
import { defineGroup } from 'duneta/server/routers';

export const ${exportName} = defineGroup({
  path: '${routePathFromName(name)}',
  endpoints: [
    { method: 'GET', handler: resolveController('${controller}', 'index') },
    { method: 'GET', path: '/:id', handler: resolveController('${controller}', 'show') },
  ],
});
`,
  );
}

function makePolicy(name) {
  const base = kebab(name);
  const exportName = `${camel(name)}Policy`;
  writeNewFile(
    path.join(appRoot, 'api/policies', `${base}-policy.ts`),
    `import type { Permission, PolicySubject } from 'duneta/server/permissions';

export const ${exportName} = {
  can(permission: Permission, subject?: PolicySubject) {
    void subject;
    return permission === '*';
  },
};
`,
  );
}

function makeMiddleware(name) {
  const base = kebab(name);
  const exportName = `${camel(name)}Middleware`;
  writeNewFile(
    path.join(appRoot, 'api/middlewares', `${base}.ts`),
    `import { createMiddleware } from 'hono/factory';
import type { RequestContext } from 'duneta/server/middlewares';

export const ${exportName} = createMiddleware<RequestContext>(async (_c, next) => {
  await next();
});
`,
  );
}

function makeCron(name) {
  const base = kebab(name);
  const cronName = base.endsWith('-cron') ? base.slice(0, -'-cron'.length) : base;
  const fileBase = `${cronName}-cron`;
  const className = `${pascal(cronName)}Cron`;
  const cronDir = path.join(appRoot, 'api/cron');
  writeNewFile(
    path.join(cronDir, `${fileBase}.ts`),
    `import { BaseKernelCron, type CronJobContext } from 'duneta/server/cron';

export class ${className} extends BaseKernelCron {
  readonly name = '${cronName}';
  readonly schedule = '0 0 * * *';

  async handle(ctx: CronJobContext) {
    void ctx;
  }
}
`,
  );
  updateCronKernel(cronDir, fileBase, className);
}

function defaultCronKernel() {
  return `import { defineCronKernel } from 'duneta/server/cron';

export const registerCron = defineCronKernel([
  // Register cron classes here.
]);
`;
}

function updateCronKernel(cronDir, fileBase, className) {
  const kernelFile = path.join(cronDir, 'index.ts');
  if (!existsSync(kernelFile)) {
    writeNewFile(kernelFile, defaultCronKernel());
  }

  let content = fs.readFileSync(kernelFile, 'utf8');
  const importLine = `import { ${className} } from './${fileBase}';`;
  if (!content.includes(importLine)) {
    const importMatches = [...content.matchAll(/^import .+;$/gm)];
    const insertAt = importMatches.length
      ? importMatches[importMatches.length - 1].index + importMatches[importMatches.length - 1][0].length
      : 0;
    content = `${content.slice(0, insertAt)}\n${importLine}${content.slice(insertAt)}`;
  }

  if (!content.includes(`${className},`)) {
    const marker = 'defineCronKernel([';
    const markerIndex = content.indexOf(marker);
    if (markerIndex === -1) {
      console.log(`[duneta] add ${className} to ${path.relative(projectRoot, kernelFile)} manually`);
      return;
    }
    const insertAt = content.indexOf('\n', markerIndex + marker.length);
    const line = `  ${className},\n`;
    content = `${content.slice(0, insertAt + 1)}${line}${content.slice(insertAt + 1)}`;
  }

  writeFile(kernelFile, content);
}

function packagesBuilt() {
  return (
    existsSync(path.join(clientRoot, 'dist/components/index.js')) &&
    existsSync(path.join(serverRoot, 'dist/http/index.js')) &&
    existsSync(path.join(serverRoot, 'dist/cron/index.js'))
  );
}

function findMonorepoRoot() {
  let dir = projectRoot;
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function buildPackagesIfNeeded() {
  if (packagesBuilt()) return;
  const monorepoRoot = findMonorepoRoot();
  if (!monorepoRoot) {
    console.error('[duneta] duneta/client or duneta/server is not built. Reinstall duneta.');
    process.exit(1);
  }
  console.log('[duneta] building duneta-client and duneta-server…');
  run('pnpm', ['--filter', 'duneta-client', '--filter', 'duneta-server', 'run', 'build'], monorepoRoot);
}

async function loadSyncRouters() {
  const mod = await import(pathToFileURL(path.join(clientRoot, 'scripts/sync-routers.mjs')).href);
  return mod.syncRouters;
}

async function loadSyncApi() {
  const mod = await import(pathToFileURL(path.join(serverRoot, 'scripts/sync-api.mjs')).href);
  return mod.syncApi;
}

function loadWebConfig() {
  const script = path.join(clientRoot, 'scripts/load-config.mjs');
  const tsx = bin('tsx', 'dist/cli.mjs');
  const r = spawnSync(process.execPath, [tsx, script, projectRoot], {
    encoding: 'utf8',
    cwd: projectRoot,
  });
  if (r.status !== 0) throw new Error(r.stderr || 'Failed to load duneta.client.config.ts');
  return JSON.parse(r.stdout);
}

async function sync() {
  const syncApi = await loadSyncApi();
  syncApi(path.join(appRoot, 'api'));
}

function walkFiles(dir, predicate, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, predicate, out);
      continue;
    }
    if (predicate(entry.name, full)) out.push(full);
  }
  return out.sort();
}

function readIfExists(file) {
  return existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function extractBalanced(source, start) {
  const open = source[start];
  const close = open === '{' ? '}' : open === '[' ? ']' : ')';
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    if (char === close) depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  return '';
}

function routeNamesFromRouter(routerSource) {
  const names = new Set();
  const composeIndex = routerSource.indexOf('composeRouter');
  if (composeIndex === -1) return names;
  const arrayStart = routerSource.indexOf('[', composeIndex);
  if (arrayStart === -1) return names;
  const body = extractBalanced(routerSource, arrayStart);
  for (const match of body.matchAll(/\b([a-zA-Z_$][\w$]*)(?:\s*\(\s*\))?/g)) {
    const name = match[1];
    if (!['composeRouter'].includes(name)) names.add(name);
  }
  return names;
}

function exportNames(source) {
  return [...source.matchAll(/export\s+(?:const|function)\s+([a-zA-Z_$][\w$]*)/g)].map(
    (match) => match[1],
  );
}

function joinRoutePath(base, leaf = '/') {
  const left = base === '/' ? '' : base.replace(/\/+$/, '');
  const right = leaf === '/' ? '' : leaf.replace(/^\/+/, '/');
  return `${left}${right}` || '/';
}

function parseRouteGroups(file) {
  const source = readIfExists(file);
  const groups = [];

  for (const match of source.matchAll(/defineGroup\s*\(/g)) {
    const objectStart = source.indexOf('{', match.index);
    if (objectStart === -1) continue;
    const body = extractBalanced(source, objectStart);
    const basePath = body.match(/\bpath\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    if (!basePath) continue;

    const endpointsIndex = body.indexOf('endpoints');
    const arrayStart = endpointsIndex === -1 ? -1 : body.indexOf('[', endpointsIndex);
    const endpointsBody = arrayStart === -1 ? '' : extractBalanced(body, arrayStart);
    const endpoints = [];
    for (const endpointMatch of endpointsBody.matchAll(/\{[^{}]*\bmethod\s*:\s*['"`]([A-Z]+)['"`][^{}]*\}/g)) {
      const endpoint = endpointMatch[0];
      const method = endpointMatch[1];
      const leafPath = endpoint.match(/\bpath\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] ?? '/';
      endpoints.push({ method, path: joinRoutePath(basePath, leafPath) });
    }
    groups.push({ basePath, endpoints });
  }

  return groups;
}

function frameworkRouteGroups(routerSource) {
  const groups = [];
  if (/\bhealthRoutes\b/.test(routerSource)) {
    groups.push({ source: 'duneta/server/routers', endpoints: [{ method: 'GET', path: '/health' }] });
  }
  if (/\bmeRoutes\b/.test(routerSource)) {
    groups.push({ source: 'duneta/server/routers', endpoints: [{ method: 'GET', path: '/me' }] });
  }
  if (/\b(createUsersRoutes|usersRoutes)\b/.test(routerSource)) {
    groups.push({
      source: 'duneta/server/routers',
      endpoints: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/:id' },
      ],
    });
  }
  return groups;
}

function listRoutes() {
  const apiRoot = path.join(appRoot, 'api');
  const routerFile = path.join(apiRoot, 'router.ts');
  const routerSource = readIfExists(routerFile);
  const mounted = routeNamesFromRouter(routerSource);
  const routeFiles = walkFiles(apiRoot, (name) => name === 'routes.ts' || name.endsWith('.routes.ts'));
  const rows = [];

  for (const group of frameworkRouteGroups(routerSource)) {
    for (const endpoint of group.endpoints) {
      rows.push({ ...endpoint, source: group.source });
    }
  }

  for (const file of routeFiles) {
    const source = readIfExists(file);
    const names = exportNames(source);
    if (mounted.size > 0 && names.length > 0 && !names.some((name) => mounted.has(name))) {
      continue;
    }
    for (const group of parseRouteGroups(file)) {
      for (const endpoint of group.endpoints) {
        rows.push({ ...endpoint, source: path.relative(projectRoot, file) });
      }
    }
  }

  if (rows.length === 0) {
    console.log('[duneta] no routes found');
    return;
  }

  const methodWidth = Math.max(6, ...rows.map((row) => row.method.length));
  const pathWidth = Math.max(4, ...rows.map((row) => row.path.length));
  for (const row of rows) {
    console.log(`${row.method.padEnd(methodWidth)} ${row.path.padEnd(pathWidth)} ${row.source}`);
  }
}

async function buildWeb() {
  const syncRouters = await loadSyncRouters();
  const webConfig = loadWebConfig();
  syncRouters(appRoot, clientRoot, webConfig);
  run(process.execPath, [bin('@react-router/dev'), 'build'], projectRoot);
}

async function buildAll() {
  buildPackagesIfNeeded();
  await sync();
  await buildWeb();
}

const [command = 'dev', ...rest] = process.argv.slice(2);

try {
  switch (command) {
    case 'prepare':
      buildPackagesIfNeeded();
      break;
    case 'dev': {
      buildPackagesIfNeeded();
      await sync();
      const syncRouters = await loadSyncRouters();
      syncRouters(appRoot, clientRoot, loadWebConfig());
      console.log('[duneta] http://localhost:8787 (HMR)');
      run(process.execPath, [bin('@react-router/dev'), 'dev', ...rest], projectRoot);
      break;
    }
    case 'deploy':
      await buildAll();
      run(
        process.execPath,
        [
          wrangler(),
          'deploy',
          '--config',
          path.join(appRoot, 'build/server/wrangler.json'),
          ...rest,
        ],
        projectRoot,
      );
      break;
    case 'build':
      await buildAll();
      break;
    case 'routes':
    case 'route:list':
      listRoutes();
      break;
    case 'make:page':
      makePage(requireName(command, rest));
      break;
    case 'make:controller':
      makeController(requireName(command, rest));
      break;
    case 'make:repository':
      makeRepository(requireName(command, rest));
      break;
    case 'make:route':
      makeRoute(requireName(command, rest));
      break;
    case 'make:policy':
      makePolicy(requireName(command, rest));
      break;
    case 'make:middleware':
      makeMiddleware(requireName(command, rest));
      break;
    case 'make:cron':
      makeCron(requireName(command, rest));
      break;
    default:
      console.error(`[duneta] unknown command: ${command}`);
      console.error('[duneta] usage: duneta <dev|build|deploy|prepare|routes|make:page|make:controller|make:repository|make:route|make:policy|make:middleware|make:cron>');
      process.exit(1);
  }
} catch (error) {
  console.error(`[duneta] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
