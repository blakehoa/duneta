# Cấu hình

## Hai file config

```text
config/client.ts  → Vite / React Router / sync routers (web)
config/server.ts  → Worker API only (lazy load lúc runtime)
```

Vite **không** import server config → secrets không evaluate lúc web build.

| File               | Đọc bởi                             | Nội dung                                                            |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| `config/client.ts` | `loadConfig`, sync routers          | `app`, `theme`, `api`, `locale`, `router`, `image` (sizes, quality) |
| `config/server.ts` | `createDunetaWorker()` runtime load | `database`, `auth`, `image` (domains, cache), …                     |

Image optimization route is fixed at `/duneta/views/image` (`IMAGE_OPTIMIZATION_PATH`) — not in user config.

Cấu hình sai → runtime lỗi. Framework không tự skip.

## Secrets (không bake vào bundle)

**Dev:** `.env` ở project root — Wrangler / Cloudflare Vite plugin inject vào Worker runtime → `process.env` (`nodejs_compat_populate_process_env`).

**Prod:**

```bash
wrangler secret put AUTH_SECRET
wrangler secret put CSRF_SECRET
```

Postgres credentials live on the **Hyperdrive** config (dashboard / `wrangler hyperdrive create`), not as `DATABASE_URL` Worker secrets.

Khai báo trong `wrangler.jsonc`:

```jsonc
"secrets": {
  "required": ["AUTH_SECRET", "CSRF_SECRET"]
},
"hyperdrive": [
  { "binding": "HYPERDRIVE", "id": "<cached-hyperdrive-id>" },
  { "binding": "HYPERDRIVE_AUTH", "id": "<cache-disabled-hyperdrive-id>" }
],
"ratelimits": [
  {
    "name": "API_RATE_LIMITER",
    "namespace_id": "1001",
    "simple": { "limit": 100, "period": 60 }
  }
]
```

**CI build:** không set secret env vars, không `.env` — `pnpm build` sạch.

**Worker** (`worker.ts`):

```ts
import { createDunetaWorker } from 'duneta/worker';
export default createDunetaWorker();
```

`config/server.ts` — chỉ API features + `process.env.*` cho secrets. **`app.name` / `app.env` không cần lặp** — `app.name` chỉ client; `app.env` server auto từ `process.env.NODE_ENV` (Wrangler `vars.NODE_ENV`).

```ts
import {
  defineConnections,
  defineServerConfig,
  postgres,
} from 'duneta/config/server';

export default defineServerConfig({
  database: {
    enabled: true,
    default: 'primary',
    connections: defineConnections({
      primary: postgres('HYPERDRIVE'),
      auth: postgres('HYPERDRIVE_AUTH'),
      // analytics: postgres('HYPERDRIVE_ANALYTICS'),
    }),
  },
  auth: {
    enabled: true,
    database: 'auth',
    secret: process.env.AUTH_SECRET ?? '',
  },
  security: {
    cors: {
      origins: ['https://app.example.com'],
      credentials: true,
    },
  },
});
```

When `database.enabled`, every connection **must** use a Hyperdrive binding ([supported engines](https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/)). Extra DBs: `databases` in `registerServices`.
Use a cache-disabled Hyperdrive configuration for `auth.database`; session and
permission reads must not receive stale query-cache results.

Connections open **lazily per repository**: nothing connects until a repository
(or `resolveAuthSession`) first needs a connection, and every repository in the
same request shares one client per connection name. Routes carry no database
metadata:

```ts
ApiRoute.define({
  path: '/orders',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('OrderController', 'index') },
  ],
});
```

Repositories declare which connections they may use:

```ts
export class AnalyticsRepository extends BasePgRepository<typeof event> {
  protected readonly databases = ['primary', 'analytics'] as const;

  constructor() {
    super(event);
  }

  async findEvents() {
    const db = await this.db('analytics');
    return db.select().from(event);
  }
}
```

CORS for cookie auth:

```ts
security: {
  cors: {
    origins: ['https://app.example.com'],
    credentials: true,
    allowHeaders: ['X-Tenant-Id'],
    maxAge: 600,
  },
}
```

For native Cloudflare rate limiting, set `binding` on the matching rate-limit
rule to the Wrangler `ratelimits[].name`. Its `max`/`windowMs` must match the
binding's `limit`/`period`.

Verify sau build: `grep -r postgresql:// app/build/server/` → rỗng.

Bindings (Hyperdrive, R2, …) — `wrangler.jsonc` (dev) / `wrangler.production.jsonc` (build+deploy). Static assets (`ASSETS`) do `pnpm build` + `createDunetaWorker` — không cấu hình tay.

## Client config (web)

`config/client.ts`:

```ts
import { defineClientConfig } from 'duneta/config/client';

export default defineClientConfig({
  app: { name: 'my-app', env: 'development' },
  theme: { default: 'light' },
  api: { baseUrl: '/api' },
  locale: { default: 'vi', supported: ['vi', 'en'] },
});
```

## Server config (API) — opt in

`config/server.ts` khi cần DB/auth — xem `examples/dogfood`. Kèm mount route trong `routes/api.ts` và register service trong `app/providers/app-service-provider.ts`.

### Đọc config lúc runtime (API)

```ts
import { getConfig } from 'duneta/config/server';
```

## Logging

Workers **không có filesystem** — stdout JSON. Set trong `config/server.ts`:

```ts
logging: { enabled: true, format: 'json' },
```

## Cache / Storage / Auth / Rate limit / Cron

Cấu hình trong `config/server.ts`. Chi tiết storage: [storage](./api/storage.md). Cron: [cron](./api/cron.md).

## Worker bindings

| File                             | Purpose                          |
| -------------------------------- | -------------------------------- |
| `wrangler.jsonc`                 | Local `duneta dev`               |
| `wrangler.production.jsonc`      | `duneta build` / `duneta deploy` |
| `app/build/server/wrangler.json` | Generated deploy artifact        |
