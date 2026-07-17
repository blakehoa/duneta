# Duneta

Một Cloudflare Worker: web + `/api` cùng domain.

```bash
# App mới (sau khi publish npm)
npx create-duneta-app my-app

# Monorepo / dogfood
pnpm install && pnpm dev
```

```bash
pnpm deploy
```

Lần đầu: đăng nhập Cloudflare (`wrangler login` hoặc `CLOUDFLARE_API_TOKEN`).  
App mới chỉ health check — DB/auth opt-in trong `config/server.ts` khi cần.

Production: `wrangler.production.jsonc` (Hyperdrive id + `AUTH_BASE_URL`) + `wrangler secret put AUTH_SECRET` / `CSRF_SECRET`.

## Dev local

```bash
pnpm dev    # HMR → http://localhost:8787 — secrets trong `.env`, map trong `config/server.ts`
```

## Cấu trúc

```text
config/client.ts       # web (theme, api)
config/server.ts       # API (database, auth, …)
vite.config.mts        # Vite + Cloudflare plugin
react-router.config.mts
wrangler.jsonc         # Worker dev (deploy → app/build/server/wrangler.json)

worker.ts              # entry
routes/                # web.ts / api.ts / console.ts — ApiRoute.Config, WebRoute.Config
app/                   # source only
├── providers/         # registerServices + resolvePermissions
├── http/              # backend modules
├── pages/             # web pages
├── themes/            # CSS
└── build/             # generated
```
