import type { ExecutionContextLike, ScheduledControllerLike } from './server.js';
import { defineServer } from './server.js';
import type { DunetaWorkerOptions, ServerOptions } from './types.js';

/** Cloudflare Workers Assets binding — internal; wired by generated deploy config only. */
const ASSETS_BINDING = 'ASSETS';

export type { DunetaWorkerOptions };

export type DunetaWorkerExport = {
  fetch: (request: Request, env: unknown, ctx: ExecutionContextLike) => Promise<Response>;
  scheduled: (
    controller: ScheduledControllerLike,
    env: unknown,
    ctx: ExecutionContextLike,
  ) => Promise<void>;
};

type ReactRouterModule = {
  createRequestHandler: (
    build: () => Promise<unknown>,
    mode?: string,
  ) => (request: Request, context: unknown) => Promise<Response>;
  RouterContextProvider: new () => unknown;
};

function viteMode(): string | undefined {
  const env = (import.meta as ImportMeta & { env?: { PROD?: boolean; MODE?: string } }).env;
  return env?.PROD ? 'production' : env?.MODE;
}

function createWebHandler() {
  let handler: ((request: Request) => Promise<Response>) | undefined;

  return async (request: Request) => {
    if (!handler) {
      // App bundle provides react-router + @react-router/dev virtual modules.
      const rr = (await import('react-router')) as unknown as ReactRouterModule;
      const web = rr.createRequestHandler(
        // @ts-expect-error — Vite virtual module from @react-router/dev
        () => import('virtual:react-router/server-build'),
        viteMode(),
      );
      handler = (req) => web(req, new rr.RouterContextProvider());
    }
    return handler(request);
  };
}

function hasUnresolvedPaths(options: object): boolean {
  return Object.values(options).some((value) => typeof value === 'string');
}

/**
 * Cloudflare Worker entry: `/api/*` → Hono, static assets, everything else → React Router SSR.
 *
 * Config is always `./config/server.ts` (or `.js`) at the project root.
 * Pass other module paths (or omit for defaults). The Duneta Vite plugin rewrites them to imports.
 *
 * @example
 * export default createDunetaWorker();
 *
 * @example
 * export default createDunetaWorker({
 *   routes: './routes/api',
 *   services: './app/providers/app-service-provider',
 * });
 */
export function createDunetaWorker(options?: DunetaWorkerOptions): DunetaWorkerExport;
/** @internal Vite plugin output. */
export function createDunetaWorker(options: ServerOptions): DunetaWorkerExport;
export function createDunetaWorker(
  options?: DunetaWorkerOptions | ServerOptions,
): DunetaWorkerExport {
  const resolved = options ?? {};

  if (hasUnresolvedPaths(resolved)) {
    throw new Error(
      '[duneta] createDunetaWorker path options were not rewritten. Use createDunetaViteConfig() in vite.config.',
    );
  }

  const api = defineServer(resolved as ServerOptions);
  const web = createWebHandler();

  return {
    async fetch(request, env) {
      const { pathname } = new URL(request.url);

      if (pathname === '/api' || pathname.startsWith('/api/')) {
        return api.fetch(request, env as Record<string, unknown>);
      }

      const assets = (env as Record<string, { fetch: typeof fetch } | undefined>)[ASSETS_BINDING];
      if (assets) {
        const response = await assets.fetch(request);
        if (response.status !== 404) return response;
      }

      return web(request);
    },
    scheduled: (controller, env, ctx) => api.scheduled(controller, env, ctx),
  };
}
