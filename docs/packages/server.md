# Server-side layers (`duneta/routes`, `duneta/http`, `duneta/middleware/http`, `duneta/worker`)

## Core vs build sẵn

| | Core | Build sẵn |
|---|------|-----------|
| Ví dụ | `defineServer`, `defineServices`, `createDatabase`, `createAuth`, middleware | `HealthController`, `healthRoutes`, `UserRepository` |
| Bắt buộc? | Luôn (runtime) | Không — user import + mount nếu muốn |
| Bật/tắt | Optional modules qua `config/server.ts` | N/A — chỉ chạy khi user register + mount route |

## Phân tách module

| Module | Trách nhiệm | Không chứa |
|--------|-------------|------------|
| `duneta/routes` | Route definitions + compose/build (`ApiRoute`, `WebRoute`) | Middleware runtime |
| `duneta/middleware/http` | Hono middleware runtime | Route definitions |
| `duneta/middleware/page` | SSR page middleware runtime | Route definitions |
| `duneta/http` | Controllers, DI, `createHttpApp` | Route definitions |
| `duneta/worker` | Worker boot, load `routes/api.ts` | Route build logic (delegate → `duneta/routes`) |

## Cấu trúc

```text
packages/duneta/
├── worker/            # defineServer, boot, createDunetaWorker
├── routes/            # ApiRoute, WebRoute, compose/build APIs
│   ├── api.ts         # ApiRoute.define, buildApiRouter, healthRoutes, …
│   └── web.ts         # WebRoute.define, buildWebRouter, collectWebRouteMiddlewares
├── http/
│   ├── create-app.ts  # createHttpApp, attachRequestServices
│   ├── container/     # RegisterServices, DI containers
│   ├── controllers/   # built-in controllers
│   └── repositories/  # built-in repositories
├── middleware/
│   ├── http/          # Hono/API middleware
│   └── page/          # React Router SSR middleware
├── permission/        # grants, policies, PermissionCheck
├── auth/              # Better Auth (login — không phải DI)
├── config/server/     # DunetaServerConfig
└── scripts/           # sync-routers.mjs (gọi từ bin/duneta.mjs)
```

## Exports chính

| Path | Symbols |
|------|---------|
| `duneta/worker` | `createDunetaWorker`, `defineServer`, `buildApiRouter` |
| `duneta/routes` | `ApiRoute`, `WebRoute`, `buildApiRouter`, `buildWebRouter`, `composeApiRoutes` |
| `duneta/http/container` | `RegisterServices`, `ServiceRegistryContext` |
| `duneta/http` | `resolveController`, `BaseController`, `createHttpApp` |
| `duneta/middleware/http` | `requireSession`, `RequestContext` |
| `duneta/middleware/page` | `runPageMiddlewares`, `DunetaPageMiddleware` |
| `duneta/permission` | `UserPolicy`, `PermissionResolver` |

## App usage

```ts
// routes/api.ts
import type { ApiRoute } from 'duneta/routes';
import { postsRoutes } from '../app/http/controllers/post';

export default { api: [postsRoutes] } satisfies ApiRoute.Config;
```

```ts
// app/http/controllers/post/routes.ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';

export const postsRoutes = ApiRoute.define({
  path: '/posts',
  endpoints: [{ method: 'GET', handler: resolveController('PostController', 'index') }],
});
```

```ts
// routes/web.ts
import { WebRoute } from 'duneta/routes';

export default {
  pages: [WebRoute.define({ path: '/', layout: 'layout.tsx', page: 'page.tsx' })],
} satisfies WebRoute.Config;
```
