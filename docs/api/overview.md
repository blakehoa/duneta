# API app (`routes/api.ts` + `app/http/controllers`)

## Cấu trúc

```text
routes/
├── api.ts                 → API route registry (ApiRoute.Config)
└── console.ts             → cron jobs (optional)
app/
├── providers/app-service-provider.ts
└── http/controllers/
    └── <feature>/
        ├── *-controller.ts
        └── routes.ts      → ApiRoute.define(...)
```

Config web: `config/client.ts`. API: `config/server.ts` (lazy load trong worker).

App scaffold (`create-duneta-app`): `routes/api.ts` chỉ routes tối thiểu. DB/auth là opt-in — xem [Kiến trúc](../architecture.md).

## Import paths

| Layer | Import từ | Dùng cho |
|-------|-----------|----------|
| Route definitions | `duneta/routes` | `ApiRoute.define`, `ApiRoute.Config` |
| Controllers / DI | `duneta/http` | `resolveController`, `BaseController` |
| Hono middleware | `duneta/middleware/http` | `requireSession`, `RequestContext` |
| Worker boot | `duneta/worker` | `createDunetaWorker` |

## Entry

API bootstrap trong `worker.ts` — `createDunetaWorker()` tự load `routes/api.ts` + `app/providers/app-service-provider.ts`.

`buildApiRouter()` (trong `duneta/routes`) đọc `routes/api.ts`, merge framework defaults, compose Hono router.

## Hooks

| Hook | File | Vai trò |
|------|------|---------|
| `registerServices` | `app/providers/app-service-provider.ts` | DI controllers + repositories |
| `api routes` | `routes/api.ts` | `ApiRoute.Config` — mount app route groups |
| `resolvePermissions` | `app/providers/app-service-provider.ts` | Grants / roles sau login |

Chi tiết: [services](./services.md), [sync](./sync.md), [runtime](./runtime.md), [routes](./routes.md).
