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

The command creates the class and adds it to `routes/console.ts`.

```ts
// routes/delete-user-session-cron.ts
import { BaseKernelCron, type CronJobContext } from 'duneta/http/cron';

export class DeleteUserSessionCron extends BaseKernelCron {
  readonly name = 'delete-user-session';
  readonly schedule = '0 0 * * *';

  async handle({ cache, waitUntil, ensureDb, db }: CronJobContext) {
    // Prefer repositories (`await this.db()`). If you need `ctx.db` facade:
    await ensureDb();
    void db;

    waitUntil(cache.set('cron:last-delete-user-session', String(Date.now())));
  }
}
```

`ensureDb(name?)` opens (and shares) a Hyperdrive client for this scheduled
invocation. The `db` field is a **sync boot facade** — call `await ensureDb()`
(or use a repository) before touching `db.*`. Background work registered with
`waitUntil` keeps the database scope open until those promises settle.

## Register in the kernel

```ts
// routes/console.ts
import { defineCronKernel } from 'duneta/http/cron';
import { DeleteUserSessionCron } from './delete-user-session-cron';

export const registerCron = defineCronKernel([
  DeleteUserSessionCron,
]);
```

Mount from `worker.ts` via `createDunetaWorker()` (auto loads `routes/console.ts`):

```ts
import { createDunetaWorker } from 'duneta/worker';
export default createDunetaWorker();
```

## Enable config

```ts
// config/server.ts
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
