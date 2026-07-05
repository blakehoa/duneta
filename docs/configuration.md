# Cấu hình

## Hai file config

```text
config/client.ts  → Vite / React Router / sync routers (web)
config/server.ts  → Worker API only (lazy load lúc runtime)
```

Vite **không** import server config → secrets không evaluate lúc web build.

| File | Đọc bởi | Nội dung |
|------|---------|----------|
| `config/client.ts` | `loadConfig`, sync routers | `app`, `theme`, `api`, `locale`, `router`, `image` (sizes, quality) |
| `config/server.ts` | `createDunetaWorker()` runtime load | `database`, `auth`, `image` (domains, cache), … |

Image optimization route is fixed at `/duneta/views/image` (`IMAGE_OPTIMIZATION_PATH`) — not in user config.

Cấu hình sai → runtime lỗi. Framework không tự skip.

## Secrets (không bake vào bundle)

**Dev:** `.env` ở project root — Wrangler / Cloudflare Vite plugin inject vào Worker runtime → `process.env` (`nodejs_compat_populate_process_env`).

**Prod:**

```bash
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET
wrangler secret put CSRF_SECRET
```

Khai báo trong `wrangler.jsonc`:

```jsonc
"secrets": {
  "required": ["DATABASE_URL", "AUTH_SECRET", "CSRF_SECRET"]
}
```

**CI build:** không set secret env vars, không `.env` — `pnpm build` sạch.

**Worker** (`worker.ts`):

```ts
import { createDunetaWorker } from 'duneta/worker';
export default createDunetaWorker();
```

`config/server.ts` — chỉ API features + `process.env.*` cho secrets. **`app.name` / `app.env` không cần lặp** — `app.name` chỉ client; `app.env` server auto từ `process.env.NODE_ENV` (Wrangler `vars.NODE_ENV`).

```ts
import { defineServerConfig } from 'duneta/config/server';

export default defineServerConfig({
  database: {
    enabled: true,
    connections: defineConnections({
      primary: { driver: 'postgres', url: process.env.DATABASE_URL ?? '' },
    }),
  },
  auth: { enabled: true, secret: process.env.AUTH_SECRET ?? '' },
});
```

Verify sau build: `grep -r postgresql:// app/build/server/` → rỗng.

Bindings (Hyperdrive, R2, …) — `wrangler.jsonc` / `wrangler.production.jsonc.example`. Static assets (`ASSETS`) do `pnpm build` + `createDunetaWorker` — không cấu hình tay.

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

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Dev + `secrets.required` |
| `wrangler.production.jsonc.example` | Hyperdrive, R2 (optional) |
| `app/build/server/wrangler.json` | Generated deploy |
