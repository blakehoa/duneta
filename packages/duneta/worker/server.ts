import { createCronKernel, runDueCronJobs } from '../http/cron/index.js';
import { isCronEnabled } from '../config/server/features.js';
import { loadApp, loadRuntimeServices } from './boot.js';
import type { ServerOptions } from './types.js';
import { loadServerConfig } from './load-config.js';

export type { ServerOptions } from './types.js';
export type {
  RegisterServices,
  ServiceRegistryContext,
} from '../http/container/index.js';

export type ScheduledControllerLike = {
  cron: string;
  scheduledTime: number;
};

export type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
};

export type ServerExport = {
  fetch: (request: Request) => Promise<Response>;
  scheduled: (
    controller: ScheduledControllerLike,
    env: unknown,
    ctx: ExecutionContextLike,
  ) => Promise<void>;
};

export function defineServer(options: ServerOptions): ServerExport {
  let boot: Promise<void> | undefined;

  async function ensureBoot() {
    if (!boot) {
      boot = loadServerConfig().then(() => undefined);
    }
    await boot;
  }

  return {
    async fetch(request) {
      await ensureBoot();
      const hono = await loadApp(options);
      return hono.fetch(request);
    },
    async scheduled(controller, _env, ctx) {
      await ensureBoot();
      const runtime = await loadRuntimeServices(options);
      if (!isCronEnabled(runtime.config)) return;

      const kernel = await createCronKernel(runtime.registerCron);
      await runDueCronJobs(kernel.due(controller.cron), {
        cron: controller.cron,
        scheduledTime: controller.scheduledTime,
        config: runtime.config,
        db: runtime.db,
        auth: runtime.auth,
        cache: runtime.cache,
        controllers: runtime.controllers,
        repositories: runtime.repositories,
        waitUntil: (promise) => ctx.waitUntil(promise),
      });
    },
  };
}
