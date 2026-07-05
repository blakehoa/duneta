# Middleware

Duneta có hai nhóm middleware. Chúng chạy ở hai phần khác nhau của request lifecycle và không dùng thay thế cho nhau.

```text
Cloudflare Worker request
  ├─ /api/*  → Hono HTTP middleware → Hono route/controller
  └─ /*      → React Router SSR     → page middleware around HTML render
```

## Import paths

| Dùng cho | Import từ | Hình dạng middleware |
|----------|------------|---------------------|
| API route groups, controllers, Hono context | `duneta/middleware/http` | Hono `createMiddleware<RequestContext>()` |
| Page guards, redirects, SSR headers | `duneta/middleware/page` | `(context, next) => Response` |

Không có public root import `duneta/middleware`. Nhìn import là biết middleware thuộc API request hay SSR page rendering.

## API middleware

Dùng API middleware trong `routes/api.ts` hoặc route group của Hono:

```ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';
import { requireSession } from 'duneta/middleware/http';

export const postsRoutes = ApiRoute.define({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
  ],
});
```

API middleware nhận Hono context. Nó có thể đọc `c.req`, set value bằng `c.set()`, và trả JSON response.

Dùng layer này cho các concern chỉ thuộc API:

- CORS
- Auth error dạng JSON
- CSRF cho mutating API requests
- Rate limit cho API
- Truy cập controller/service qua `RequestContext`

## Page middleware

Dùng page middleware trong `routes/web.ts`:

```ts
import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';

const adminGuard: DunetaPageMiddleware = async (context, next) => {
  context.locals.section = 'admin';
  return next();
};

export default {
  pages: [
    WebRoute.define({
      path: '/admin',
      layout: 'admin/layout.tsx',
      page: 'admin/page.tsx',
      middleware: [adminGuard],
    }),
  ],
} satisfies WebRoute.Config;
```

Page middleware nhận Duneta page context, không nhận Hono context:

```ts
type DunetaPageMiddlewareContext = {
  request: Request;
  url: URL;
  responseHeaders: Headers;
  responseStatusCode: number;
  loadContext?: unknown;
  locals: Record<string, unknown>;
};
```

Dùng layer này cho các concern chỉ thuộc web/page:

- Redirect cho SSR pages
- HTML/security headers
- Page request IDs
- Locale cookies cho pages
- Page route metadata in `locals`

## Quy tắc nhớ nhanh

Nếu middleware trả JSON hoặc cần `c: Context<RequestContext>`, import từ `duneta/middleware/http`.

Nếu middleware bọc page rendering hoặc chỉnh HTML response headers, import từ `duneta/middleware/page`.

Route definitions (`ApiRoute`, `WebRoute`) import từ `duneta/routes` — không nằm trong `middleware/`.
