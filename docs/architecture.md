# Kiến trúc

## Ba lớp

| Lớp | Ở đâu | Vai trò |
|-----|-------|---------|
| **Core** | `packages/duneta`, `duneta` CLI | Runtime, DI, config, middleware, optional modules. **Mặc định OFF** — bật trong `config/server.ts`. |
| **Build sẵn** | `duneta/routes`, `duneta/http`, `duneta/http/repositories`, `duneta/starter/routers` | Controller/route/UI reference — import và dùng, hoặc bỏ qua. |
| **User app** | `config/client.ts`, `config/server.ts`, `routes/*`, `app/*` | User chọn bật feature nào, mount route nào, register service nào. |

```text
Core (engine)
  └─ optional modules ← config/server.ts enabled: true
Build sẵn (reference)
  └─ HealthController, healthRoutes, UserController, … ← import nếu cần
User app
  └─ routes/api.ts mount gì · AppServiceProvider (app/providers/app-service-provider.ts) register gì · pages/ web
```

App mới (`create-duneta-app`): chỉ `GET /api/health`, không DB/auth. `examples/dogfood` bật đủ feature — **một ví dụ**, không phải contract framework.

## Monorepo

```text
examples/dogfood/
├── worker.ts        →  /api/* (Hono) + /* (SSR + assets)
├── config/client.ts →  web (Vite / React Router)
├── config/server.ts →  API (Worker runtime only)
├── routes/          →  web.ts / api.ts / console.ts
└── app/             →  source only (pages, providers, http, themes)
packages/duneta/     →  framework (single package)
```

Web **không** import server-only modules như `duneta/http` — gọi API qua `/api` same-origin.

## Request routing

```text
GET /api/health  →  Hono (basePath /api)
GET /about       →  React Router SSR
GET /assets/*    →  ASSETS (framework — auto)
```

Middleware được tách theo request target:

| Target | Import | Chạy quanh |
|--------|--------|------------|
| API | `duneta/middleware/http` | Hono route/controller requests dưới `/api/*` |
| Page | `duneta/middleware/page` | React Router SSR page rendering |

Route **definitions** (khai báo path, endpoints, layout/page mapping) nằm trong `duneta/routes` — không trộn vào `middleware/`:

| Loại route | Khai báo ở | API |
|------------|-----------|-----|
| API (`/api/*`) | `routes/api.ts` + `app/http/controllers/*/routes.ts` | `ApiRoute.define`, `ApiRoute.Config` |
| Web (`/*`) | `routes/web.ts` | `WebRoute.define`, `WebRoute.Config` |

Không dùng root import `duneta/middleware`; app code phải chọn rõ `duneta/middleware/http` hoặc `duneta/middleware/page`.

## Boot API

`createDunetaWorker()` bootstrap trong `worker.ts` — không có `server.ts` riêng, không deploy API riêng.

| Hook | File |
|------|------|
| `server config` | `config/server.ts` (lazy runtime import) |
| `api routes` | `routes/api.ts` (`ApiRoute.Config`) |
| `web routes` | `routes/web.ts` (`WebRoute.Config`) |
| `registerServices` | `app/providers/app-service-provider.ts` |
| `resolvePermissions` | `app/providers/app-service-provider.ts` |

## Runtime

Chỉ Cloudflare Worker. Config: `wrangler.jsonc` · Entry: `worker.ts`.

## Cloudflare constraints

| Concern | Duneta approach |
|---------|-----------------|
| Logging | JSON stdout — no log files |
| Database | Postgres — URL qua `process.env` trong `config/server.ts` |
| Cache | Memory (dev) or Redis HTTP (prod) |
| Sessions | Postgres (Better Auth) |
| Static files | `ASSETS` via `createDunetaWorker` — auto on deploy |
