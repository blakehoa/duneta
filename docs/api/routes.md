# Routes (`routes/api.ts`)

## App hook

`routes/api.ts` export `{ api: [...] }` — ghép framework defaults + app routes.

```ts
import { composeRouter, defineGroup, resolveController } from 'duneta/http/router';
import { requireSession } from 'duneta/middleware/http';
```

API middleware là Hono middleware. Page middleware nằm ở `duneta/middleware/page` và chỉ dùng cho React Router SSR routes trong `routes/web.ts`.

## `defineGroup`

```ts
export const postsRoutes = defineGroup({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
  ],
});
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
| `composeRouter(groups)` | Framework | `RouteGroup[]` |
| `createAppRouter(config)` | App | `DunetaServerConfig` |

Mọi route mount dưới `/api` (`createHttpApp`).

## Inspect routes

```bash
pnpm duneta routes
```

In route groups đang mount trong `routes/api.ts`, gồm framework routes (`healthRoutes`, `meRoutes`, `createUsersRoutes`) và app routes khai báo bằng `defineGroup`.

```text
GET    /health            duneta/http/router
POST   /media/images      app/http/controllers/MediaStorage/routes.ts
```
