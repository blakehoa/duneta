# Runtime

Duneta **chỉ chạy trên Cloudflare Workers**. Không có Bun, Node VPS, hay dev server tách biệt.

## Entry duy nhất

```text
wrangler.jsonc  →  worker.ts  →  fetch(request, env)
```

`worker.ts` là front controller:

| Path | Handler |
|------|---------|
| `/api/*` | Hono API (`createDunetaWorker` → `buildApiRouter` từ `routes/api.ts`) |
| static | `createDunetaWorker` → ASSETS (auto) |
| `/*` (pages) | React Router SSR (`routes/web.ts` → sync → `app/.router-runtime/`) |

## Config load

```ts
import { createDunetaWorker } from 'duneta/worker';
export default createDunetaWorker();
```

- Web: `config/client.ts` (Vite only)
- API: `config/server.ts` (lazy, runtime `process.env` từ Wrangler secrets)

## Local vs production

| | Local (`pnpm dev`) | Production (`pnpm deploy`) |
|---|---|---|
| Runtime | Vite + Workers (HMR) | Cloudflare edge |
| Secrets | `.env` → Wrangler dev | `wrangler secret put` |
| Web config | `config/client.ts` | same |
| API config | `config/server.ts` | same (runtime env) |

## CLI

| Lệnh | Mục đích |
|------|----------|
| `pnpm dev` | Sync + `react-router dev` (HMR, :8787) |
| `pnpm build` | Sync API + build React Router |
| `pnpm deploy` | Build + `wrangler deploy` |
