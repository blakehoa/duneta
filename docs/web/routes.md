# Web — Routes & theme

## Router merge

```text
packages/duneta/starter/routers/   ← defaults (layout, page, entry.server)
app/pages/                         ← your pages (override on sync)
         ↓ duneta dev / duneta build
app/.router-runtime/               ← generated (do not edit)
    layout.tsx                     ← document shell
    root.tsx                       ← re-exports layout
    page.tsx                       ← index route
    routes.ts
```

| File | Vai trò |
|------|---------|
| `layout.tsx` | HTML document + app providers + `<Scripts />`. |
| `page.tsx` | Nội dung route `/` (index). |

Mặc định app đã có `app/pages/layout.tsx` để bạn tùy biến shell / providers ngay trong project.  
Thêm `app/pages/<segment>/page.tsx` cho route mới.

## Theme

`config/client.ts` → `theme.default` (áp dụng trong `DunetaThemeProvider`).

CSS: `app/themes/globals.css`

## Gọi API

Same-origin `/api` — xem [overview](./overview.md).

## Page middleware

Page middleware thuộc `routes/web.ts`. Import route types từ `duneta/routes`, middleware runtime từ `duneta/middleware/page`:

```ts
import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';
```

Nó bọc React Router SSR page rendering. Đây không phải Hono middleware và không nhận `c: Context`.

Chỉ dùng `duneta/middleware/http` cho API route groups dưới `/api/*`.
