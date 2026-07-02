# Kiến trúc

## Ba lớp

| Lớp | Ở đâu | Vai trò |
|-----|-------|---------|
| **Core** | `packages/server`, `packages/client`, `duneta` CLI | Runtime, DI, config, middleware, optional modules. **Mặc định OFF** — bật trong `duneta.server.config.ts`. |
| **Build sẵn** | `duneta/server/routers`, `duneta/server/http`, `duneta/server/repositories`, `duneta/client/starter/routers` | Controller/route/UI reference — import và dùng, hoặc bỏ qua. |
| **User app** | `duneta.client.config.ts`, `duneta.server.config.ts`, `app/api/*`, `app/pages/` | User chọn bật feature nào, mount route nào, register service nào. |

```text
Core (engine)
  └─ optional modules ← duneta.server.config.ts enabled: true
Build sẵn (reference)
  └─ HealthController, healthRoutes, UserController, … ← import nếu cần
User app
  └─ router.ts mount gì · services.ts register gì · pages/ web
```

App mới (`create-duneta-app`): chỉ `GET /api/health`, không DB/auth. Repo dogfood monorepo bật đủ feature — **một ví dụ**, không phải contract framework.

## Monorepo

```text
worker.ts          →  /api/* (app/api)  +  /* (SSR + assets)
duneta.client.config.ts   →  web (Vite / React Router)
duneta.server.config.ts   →  API (Worker runtime only)
app/               →  source only (pages, api, themes)
packages/          →  duneta-client, duneta-server (npm) · import duneta/client, duneta/server
```

Web **không** import `duneta/server` — gọi API qua `/api` same-origin.

## Request routing

```text
GET /api/health  →  Hono (basePath /api)
GET /about       →  React Router SSR
GET /assets/*    →  ASSETS (framework — auto)
```

## Boot API

`defineServer()` bootstrap trong `worker.ts` — không có `server.ts` riêng, không deploy API riêng.

| Hook | File |
|------|------|
| `importConfig` | `duneta.server.config.ts` (lazy runtime import) |
| `createAppRouter` | `app/api/router.ts` |
| `registerServices` | `app/api/services.ts` |
| `resolvePermissions` | `app/api/permissions.ts` |

## Runtime

Chỉ Cloudflare Worker. Config: `wrangler.jsonc` · Entry: `worker.ts`.

## Cloudflare constraints

| Concern | Duneta approach |
|---------|-----------------|
| Logging | JSON stdout — no log files |
| Database | Postgres — URL qua `process.env` trong `duneta.server.config.ts` |
| Cache | Memory (dev) or Redis HTTP (prod) |
| Sessions | Postgres (Better Auth) |
| Static files | `ASSETS` via `createDunetaWorker` — auto on deploy |
