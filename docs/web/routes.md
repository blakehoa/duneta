# Web — Routes & theme

## Hai nguồn route web

| Nguồn | Vai trò |
|-------|---------|
| `app/pages/` | File React Router (`layout.tsx`, `page.tsx`, …) |
| `routes/web.ts` | Khai báo route + page middleware (`WebRoute.define`) |

`routes/web.ts` là **registry** — sync đọc file này để merge manifest và collect page middleware.  
`app/pages/` là **source pages** — nơi bạn viết component.

## Router merge

```text
packages/duneta/starter/routers/   ← defaults (layout, page, entry.server)
app/pages/                         ← your pages (override on sync)
routes/web.ts                      ← route registry + page middleware
         ↓ duneta dev / duneta build
app/.router-runtime/               ← generated (do not edit)
    layout.tsx
    root.tsx
    routes.manifest.ts             ← buildWebRouter(routes/web.ts)
    routes.ts                      ← React Router config
```

| File generated | Vai trò |
|----------------|---------|
| `layout.tsx` | HTML document + app providers + `<Scripts />`. |
| `routes.manifest.ts` | `buildWebRouter()` từ `routes/web.ts`. |
| `routes.ts` | React Router `RouteConfig` (file-based + manifest). |

Mặc định app đã có `app/pages/layout.tsx` để bạn tùy biến shell / providers ngay trong project.  
Thêm `app/pages/<segment>/page.tsx` cho route mới.

## `routes/web.ts`

Import từ `duneta/routes` — nhìn import là biết đang khai báo **web route**:

```ts
import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';

const appMiddleware: DunetaPageMiddleware = async (_context, next) => {
  const response = await next();
  return response;
};

export default {
  pages: [
    WebRoute.define({
      path: '/',
      layout: 'layout.tsx',
      page: 'page.tsx',
      middleware: [appMiddleware],
    }),
    WebRoute.define({
      path: '/about',
      layout: 'layout.tsx',
      page: 'about/page.tsx',
    }),
    WebRoute.define({
      path: '/post/:id',
      layout: 'post/layout.tsx',
      page: 'post/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.route = 'post-detail';
          return next();
        },
      ],
    }),
  ],
} satisfies WebRoute.Config;
```

| Field | Mô tả |
|-------|-------|
| `path` | URL path (string, RegExp, hoặc matcher function) |
| `layout` | File layout trong `app/pages/` (relative) |
| `page` | File page trong `app/pages/` (relative) |
| `middleware` | Page middleware — import type từ `duneta/middleware/page` |
| `children` | Nested routes (optional) |

### API framework

| Symbol | Layer | Input |
|--------|-------|-------|
| `WebRoute.define(route)` | App | Một route definition |
| `WebRoute.compose(routes)` / `buildWebRouter(routes)` | Framework | `WebRoute[]` → `{ routes }` |
| `collectWebRouteMiddlewares(router, context)` | Framework | Match middleware theo pathname |

## Page middleware

Page middleware thuộc `routes/web.ts`. Import **route types** từ `duneta/routes`, **middleware runtime** từ `duneta/middleware/page`:

```ts
import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';
```

Nó bọc React Router SSR page rendering. Đây không phải Hono middleware và không nhận `c: Context`.

Chỉ dùng `duneta/middleware/http` cho API route groups dưới `/api/*`.

Xem thêm: [Middleware](../middleware.md).

## Theme

`config/client.ts` → `theme.default` (áp dụng trong `DunetaThemeProvider`).

CSS: `app/themes/globals.css`

## Gọi API

Same-origin `/api` — xem [overview](./overview.md).
