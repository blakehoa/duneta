# Routes (`routes/api.ts`)

## App hook

`routes/api.ts` export `{ api: [...] }` — ghép framework defaults + app routes.

```ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';
import { requireSession } from 'duneta/middleware/http';
```

API middleware là Hono middleware. Page middleware nằm ở `duneta/middleware/page` và chỉ dùng cho React Router SSR routes trong `routes/web.ts`.

## `ApiRoute.define`

```ts
export const postsRoutes = ApiRoute.define({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
  ],
});

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
| `ApiRoute.compose(routes)` / `composeApiRoutes(routes)` | Framework | `ApiRoute[]` |
| `buildApiRouter(routes, config)` | Framework | `ApiRoute.Config` + `DunetaServerConfig` |

Mọi route mount dưới `/api` (`createHttpApp`).

## Inspect routes

```bash
pnpm duneta routes
```

In route groups đang mount trong `routes/api.ts`, gồm framework routes (`healthRoutes`, `meRoutes`, `createUsersRoutes`) và app routes khai báo bằng `ApiRoute.define`.

```text
GET    /health            duneta/routes
POST   /media/images      app/http/controllers/media-storage/routes.ts
```
