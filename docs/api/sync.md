# Sync convention

Codegen không còn tạo `services.ts/router.ts`; app dùng layout Laravel-style với `routes/api.ts` + `routes/web.ts` + `app/providers/app-service-provider.ts`.

## Manual (khuyến nghị)

```text
routes/
  api.ts                      → API route registry (ApiRoute.Config)
  web.ts                      → Web route registry (WebRoute.Config)
app/
  providers/app-service-provider.ts → registerServices + resolvePermissions
  http/controllers/*/
    routes.ts                 → ApiRoute.define(...)
  pages/                      → layout.tsx, page.tsx (React Router files)
```

## `make:*` CLI

```bash
pnpm duneta make:route posts     # → app/http/controllers/posts/routes.ts (ApiRoute.define)
pnpm duneta make:controller post
pnpm duneta make:repository post
pnpm duneta make:page dashboard
```

Sau khi tạo, mount thủ công:

1. Route group mới → import vào `routes/api.ts` (`api: [postsRoutes]`)
2. Controller/repository mới → đăng ký trong `app/providers/app-service-provider.ts`
3. Page mới → thêm file trong `app/pages/` + khai báo `WebRoute.define` trong `routes/web.ts` (nếu cần middleware hoặc custom layout mapping)
