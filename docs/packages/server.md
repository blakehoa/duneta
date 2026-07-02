# `duneta/server`

## Core vs build sẵn

| | Core | Build sẵn |
|---|------|-----------|
| Ví dụ | `defineServer`, `defineServices`, `createDatabase`, `createAuth`, middleware | `HealthController`, `healthRoutes`, `UserRepository` |
| Bắt buộc? | Luôn (runtime) | Không — user import + mount nếu muốn |
| Bật/tắt | Optional modules qua `duneta.server.config.ts` | N/A — chỉ chạy khi user register + mount route |

## Cấu trúc

```text
packages/server/
├── assembly/          # createHttpApp, attachRequestServices
├── runtime/           # defineServer, boot
├── container/         # RegisterServices, DI containers
├── routers/           # composeRouter, defineGroup, RouteGroup
├── http/              # BaseController, resolveController
├── permissions/       # grants, policies, PermissionCheck
├── middlewares/       # requireSession, CSRF, rate-limit
├── auth/              # Better Auth (login — không phải DI)
├── configs/           # DunetaServerConfig
└── scripts/           # sync-api.mjs (gọi từ scripts/duneta.mjs)
```

## Exports chính

| Path | Symbols |
|------|---------|
| `duneta/server/runtime/worker` | `defineServer`, `ServerOptions` |
| `duneta/server/container` | `RegisterServices`, `ServiceRegistryContext` |
| `duneta/server/routers` | `composeRouter`, `defineGroup`, `RouteGroup` |
| `duneta/server/http` | `resolveController`, `BaseController` |
| `duneta/server/middlewares` | `requireSession`, `RequestContext` |
| `duneta/server/permissions` | `UserPolicy`, `PermissionResolver` |
| `duneta/server/assembly` | `createHttpApp` |
