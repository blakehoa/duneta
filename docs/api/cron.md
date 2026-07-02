# Cron

Duneta cron chạy trên Cloudflare Worker scheduled events.

## Worker entry

`worker.ts` forward event vào server runtime:

```ts
export default {
  fetch(request, env) {
    // ...
  },
  scheduled(controller, env, ctx) {
    return api.scheduled(controller, env, ctx);
  },
} satisfies ExportedHandler<Env>;
```

## Create a cron class

```bash
pnpm duneta make:cron delete-user-session
```

The command creates the class and adds it to `app/api/cron/index.ts`.

```ts
// app/api/cron/delete-user-session-cron.ts
import { BaseKernelCron, type CronJobContext } from 'duneta/server/cron';

export class DeleteUserSessionCron extends BaseKernelCron {
  readonly name = 'delete-user-session';
  readonly schedule = '0 0 * * *';

  async handle({ cache, waitUntil }: CronJobContext) {
    waitUntil(cache.set('cron:last-delete-user-session', String(Date.now())));
  }
}
```

## Register in the kernel

```ts
// app/api/cron/index.ts
import { defineCronKernel } from 'duneta/server/cron';
import { DeleteUserSessionCron } from './delete-user-session-cron';

export const registerCron = defineCronKernel([
  DeleteUserSessionCron,
]);
```

Mount in `defineServer`:

```ts
const api = defineServer({
  importConfig: () => import('./duneta.server.config'),
  createAppRouter,
  registerServices,
  registerCron,
  resolvePermissions,
});
```

## Enable config

```ts
// duneta.server.config.ts
export default defineServerConfig({
  cron: { enabled: true },
});
```

## Wrangler triggers

```jsonc
{
  "triggers": {
    "crons": ["0 0 * * *"]
  }
}
```

Only cron classes whose `schedule` exactly matches `controller.cron` run for that event. A class may listen to multiple schedules:

```ts
readonly schedule = ['*/5 * * * *', '0 0 * * *'];
```
