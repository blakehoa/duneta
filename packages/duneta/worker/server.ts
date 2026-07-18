import { createCronKernel, runDueCronJobs } from '../http/cron/index.js';
import { isCronEnabled } from '../config/server/index.js';
import {
  openRequestDatabases,
  runWithRequestDatabases,
  type WorkerEnv,
} from '../http/database/index.js';
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
};

export type ServerExport = {
  fetch: (request: Request, env?: WorkerEnv) => Promise<Response>;
  scheduled: (
    controller: ScheduledControllerLike,
    env: unknown,
    ctx: ExecutionContextLike,
  ) => Promise<void>;
};

export function defineServer(options: ServerOptions): ServerExport {
  let boot: Promise<void> | undefined;

  async function ensureBoot() {
    if (!boot) boot = loadServerConfig().then(() => undefined);
    await boot;
  }

  async function withBoot<T>(run: () => Promise<T>): Promise<T> {
    await ensureBoot();
    return run();
  }

  return {
    async fetch(request, env) {
      return withBoot(async () => {
        const hono = await loadApp(options);
        return hono.fetch(request, env);
      });
    },
    async scheduled(controller, env, ctx) {
      await withBoot(async () => {
        const runtime = await loadRuntimeServices(options);
        if (!isCronEnabled(runtime.config)) return;

        const databases = await openRequestDatabases(
          runtime.config,
          env as WorkerEnv,
        );
        const db = databases[runtime.config.database.default] ?? null;
        const auth = db ? runtime.auth : null;

        const kernel = await createCronKernel(runtime.registerCron);
        await runWithRequestDatabases(
          databases,
          runtime.config.database.default,
          () =>
            runDueCronJobs(kernel.due(controller.cron), {
              cron: controller.cron,
              scheduledTime: controller.scheduledTime,
              config: runtime.config,
              db,
              auth,
              cache: runtime.cache,
              controllers: runtime.controllers,
              repositories: runtime.repositories,
              waitUntil: (promise) => ctx.waitUntil(promise),
            }),
        );
      });
    },
  };
}
