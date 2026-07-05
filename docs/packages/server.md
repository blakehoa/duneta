# Server-side layers (`duneta/http`, `duneta/middleware/http`, `duneta/worker`)

## Core vs build sẵn

| | Core | Build sẵn |
|---|------|-----------|
| Ví dụ | `defineServer`, `defineServices`, `createDatabase`, `createAuth`, middleware | `HealthController`, `healthRoutes`, `UserRepository` |
| Bắt buộc? | Luôn (runtime) | Không — user import + mount nếu muốn |
| Bật/tắt | Optional modules qua `config/server.ts` | N/A — chỉ chạy khi user register + mount route |

## Cấu trúc

```text
packages/duneta/
├── worker/            # defineServer, boot, createDunetaWorker
├── http/
│   ├── create-app.ts  # createHttpApp, attachRequestServices
│   ├── container/     # RegisterServices, DI containers
│   ├── router/        # composeRouter, defineGroup, RouteGroup
│   ├── controllers/   # built-in controllers
│   └── repositories/  # built-in repositories
├── middleware/
│   ├── http/          # Hono/API middleware
│   └── page/          # React Router SSR middleware
├── permission/        # grants, policies, PermissionCheck
├── auth/              # Better Auth (login — không phải DI)
├── config/server/     # DunetaServerConfig
└── scripts/           # sync-api.mjs (gọi từ bin/duneta.mjs)
```

## Exports chính

| Path | Symbols |
|------|---------|
| `duneta/worker` | `defineServer`, `ServerOptions` |
| `duneta/http/container` | `RegisterServices`, `ServiceRegistryContext` |
| `duneta/http/router` | `composeRouter`, `defineGroup`, `RouteGroup` |
| `duneta/http` | `resolveController`, `BaseController` |
| `duneta/middleware/http` | `requireSession`, `RequestContext` |
| `duneta/permission` | `UserPolicy`, `PermissionResolver` |
| `duneta/http` | `createHttpApp` |
