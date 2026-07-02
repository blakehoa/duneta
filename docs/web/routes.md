# Web — Routes & theme

## Router merge

```text
packages/client/starter/routers/   ← defaults (layout, page, entry.server)
app/pages/                         ← your pages (override on sync)
         ↓ duneta sync
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

`duneta.client.config.ts` → `theme.default` (áp dụng trong `DunetaThemeProvider`).

CSS: `app/themes/globals.css`

## Gọi API

Same-origin `/api` — xem [overview](./overview.md).
