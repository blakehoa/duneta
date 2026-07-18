import {
  createCronKernel,
  createCronEnsureDb,
  runDueCronJobs,
  unavailableCronDatabase,
} from '../http/cron/index.js';
import { isCronEnabled } from '../config/server/index.js';
import {
  createDatabaseScope,
  runWithDatabaseScope,
  type WorkerEnv,
} from '../http/database/index.js';
import { isDatabaseEnabled } from '../config/server/features.js';
import { loadApp, loadRuntimeServices } from './boot.js';
import type { ServerOptions } from './types.js';
import { loadServerConfig } from './load-config.js';

export type { ServerOptions } from './types.js';
export type {
  RegisterServices,
  ServiceRegistryContext,
} from '../http/container/index.js';
export type { WorkerEnv } from '../http/database/types.js';

export type ScheduledControllerLike = {
  cron: string;
  scheduledTime: number;
};

export type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
  props: unknown;
};

export type ServerExport = {
  fetch: (
    request: Request,
    env?: WorkerEnv,
    ctx?: ExecutionContextLike,
  ) => Promise<Response>;
  scheduled: (
    controller: ScheduledControllerLike,
    env: unknown,
    ctx: ExecutionContextLike,
  ) => Promise<void>;
};

/** Create the cached HTTP and scheduled Worker handlers. */
export function defineServer(options: ServerOptions): ServerExport {
  let boot: Promise<void> | undefined;

  /** Load server configuration once per isolate. */
  async function ensureBoot() {
    if (!boot) boot = loadServerConfig().then(() => undefined);
    await boot;
  }

  /** Run one handler after isolate boot completes. */
  async function withBoot<T>(run: () => Promise<T>): Promise<T> {
    await ensureBoot();
    return run();
  }

  return {
    async fetch(request, env, ctx) {
      return withBoot(async () => {
        const hono = await loadApp(options);
        return hono.fetch(request, env ?? undefined, ctx);
      });
    },
    async scheduled(controller, env, ctx) {
      await withBoot(async () => {
        const runtime = await loadRuntimeServices(options);
        if (!isCronEnabled(runtime.config)) return;

        const scope = isDatabaseEnabled(runtime.config)
          ? createDatabaseScope(runtime.config, env as WorkerEnv)
          : null;

        const kernel = await createCronKernel(runtime.registerCron);
        const runJobs = () =>
          runDueCronJobs(kernel.due(controller.cron), {
            cron: controller.cron,
            scheduledTime: controller.scheduledTime,
            config: runtime.config,
            // Facade — call `await ensureDb()` (or a repository) before using it.
            db: scope ? runtime.db : null,
            auth: scope ? runtime.auth : null,
            cache: runtime.cache,
            controllers: runtime.controllers,
            repositories: runtime.repositories,
            ensureDb: scope ? createCronEnsureDb() : unavailableCronDatabase,
            waitUntil: (promise) => {
              scope?.retain(promise);
              ctx.waitUntil(promise);
            },
          });

        if (!scope) {
          await runJobs();
          return;
        }

        try {
          await runWithDatabaseScope(scope, runJobs);
        } finally {
          ctx.waitUntil(scope.close());
        }
      });
    },
  };
}
