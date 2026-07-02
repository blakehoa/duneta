# Cấu hình

## Hai file config

```text
duneta.client.config.ts  → Vite / React Router / sync routers (web)
duneta.server.config.ts  → Worker API only (lazy load lúc runtime)
```

Vite **không** import server config → secrets không evaluate lúc web build.

| File | Đọc bởi | Nội dung |
|------|---------|----------|
| `duneta.client.config.ts` | `loadConfig`, sync routers | `app`, `theme`, `api`, `locale`, `router`, `image` (sizes, quality) |
| `duneta.server.config.ts` | `defineServer({ importConfig })` | `database`, `auth`, `image` (domains, cache), … |

Image optimization route is fixed at `/duneta/image` (`IMAGE_OPTIMIZATION_PATH`) — not in user config.

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
const api = defineServer({
  importConfig: () => import('./duneta.server.config'),
  createAppRouter,
  registerServices,
  resolvePermissions,
});

return api.fetch(request);
```

`duneta.server.config.ts` — chỉ API features + `process.env.*` cho secrets. **`app.name` / `app.env` không cần lặp** — `app.name` chỉ client; `app.env` server auto từ `process.env.NODE_ENV` (Wrangler `vars.NODE_ENV`).

```ts
import { defineServerConfig } from 'duneta/server/configs';

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

`duneta.client.config.ts`:

```ts
import { defineClientConfig } from 'duneta/client/configs';

export default defineClientConfig({
  app: { name: 'my-app', env: 'development' },
  theme: { default: 'light' },
  api: { baseUrl: '/api' },
  locale: { default: 'vi', supported: ['vi', 'en'] },
});
```

## Server config (API) — opt in

`duneta.server.config.ts` khi cần DB/auth — xem dogfood monorepo. Kèm mount route + register service trong `app/api/`.

### Đọc config lúc runtime (API)

```ts
import { getConfig } from 'duneta/server/configs';
```

## Logging

Workers **không có filesystem** — stdout JSON. Set trong `duneta.server.config.ts`:

```ts
logging: { enabled: true, format: 'json' },
```

## Cache / Storage / Auth / Rate limit / Cron

Cấu hình trong `duneta.server.config.ts`. Chi tiết storage: [storage](./api/storage.md). Cron: [cron](./api/cron.md).

## Worker bindings

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Dev + `secrets.required` |
| `wrangler.production.jsonc.example` | Hyperdrive, R2 (optional) |
| `app/build/server/wrangler.json` | Generated deploy |
