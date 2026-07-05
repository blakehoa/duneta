# Web — Tổng quan

Web shell trong `app/` — routes, theme, build output cho Worker.

## Thêm page

```tsx
// app/pages/blog/page.tsx
export default function BlogPage() {
  return <h1>Blog</h1>;
}
```

Sau đó `pnpm build`.

## Config

`config/client.ts` — `api.baseUrl`, `theme.default`.

## Gọi API

Same-origin `/api` — `http` từ `duneta/http`.

```bash
pnpm dev   # web + API cùng :8787
```
