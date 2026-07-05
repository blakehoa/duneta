# Routes (`routes/api.ts`)

## Import paths

| Cần gì | Import từ |
|--------|-----------|
| Khai báo API route | `duneta/routes` — `ApiRoute.define`, `ApiRoute.Config` |
| Resolve controller | `duneta/http` — `resolveController` |
| Hono middleware | `duneta/middleware/http` — `requireSession`, … |

Nhìn import là biết đang khai báo **API route** (`duneta/routes`) hay **middleware runtime** (`duneta/middleware/http`).

## App hook

`routes/api.ts` export `{ api: [...] }` — framework tự ghép defaults (`healthRoutes`, `meRoutes`, `createUsersRoutes`) + app routes.

```ts
import type { ApiRoute } from 'duneta/routes';
import { postsRoutes } from '../app/http/controllers/post';

export default {
  api: [postsRoutes],
} satisfies ApiRoute.Config;
```

API middleware là Hono middleware. Page middleware nằm ở `duneta/middleware/page` và chỉ dùng cho React Router SSR routes trong `routes/web.ts`.

## `ApiRoute.define`

Đặt trong `app/http/controllers/*/routes.ts`:

```ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';
import { requireSession } from 'duneta/middleware/http';

export const postsRoutes = ApiRoute.define({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
    { method: 'GET', path: '/:id', handler: resolveController('PostController', 'show') },
  ],
});
```

Mount trong `routes/api.ts`:

```ts
import type { ApiRoute } from 'duneta/routes';
import { postsRoutes } from '../app/http/controllers/post';

export default {
  api: [postsRoutes],
} satisfies ApiRoute.Config;
```

## `resolveController`

```ts
resolveController('UserController', 'index')
// → controllers.resolve('UserController').index(c)
```

Controller method phải là **arrow property** (`index = async (c) =>`).

## Framework vs app

| API | Layer | Input |
|-----|-------|-------|
| `ApiRoute.define(route)` | App | Một route group |
| `ApiRoute.compose(routes)` / `composeApiRoutes(routes)` | Framework | `ApiRoute[]` → Hono router |
| `buildApiRouter(routes, config)` | Framework | `ApiRoute.Config` + `DunetaServerConfig` |

Mọi route mount dưới `/api` (`createHttpApp`).

Framework defaults (luôn mount trừ khi `api` trả về custom Hono app):

| Route | Path |
|-------|------|
| `healthRoutes` | `GET /health` |
| `meRoutes` | `GET /me` |
| `createUsersRoutes()` | `GET /users`, `GET /users/:id` |

## Inspect routes

```bash
pnpm duneta routes
```

In route groups đang mount trong `routes/api.ts`, gồm framework routes (`healthRoutes`, `meRoutes`, `createUsersRoutes`) và app routes khai báo bằng `ApiRoute.define`.

```text
GET    /health            duneta/routes
POST   /media/images      app/http/controllers/media-storage/routes.ts
```
