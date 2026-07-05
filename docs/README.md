# Tài liệu Duneta

Monorepo TypeScript: **Hono API** (`duneta/routes`, `duneta/http`, `duneta/middleware/http`) + **React Router web** (`duneta/routes`, `duneta/views`, `duneta/middleware/page`) — 1 package framework, 1 dogfood app.

## Mục lục

### Bắt đầu

- [Cài đặt & chạy dev](./getting-started.md)
- [Deploy Cloudflare Workers](./deployment.md)
- [Hướng dẫn customize](./customization.md)

### Kiến trúc

- [Tổng quan kiến trúc — ba lớp (core / build sẵn / user)](./architecture.md)
- [Cấu hình](./configuration.md)
- [Design system contract](../DESIGN.md)

### API (`routes/api.ts` + `app/http/controllers/`)

- [Tổng quan API app](./api/overview.md)
- [Sync convention](./api/sync.md)
- [Runtime](./api/runtime.md)
- [Middleware](./middleware.md)
- [Routes & `buildApiRouter`](./api/routes.md)
- [Cron scheduled jobs](./api/cron.md)
- [Services & DI](./api/services.md)
- [Controller → Repository](./api/controllers-repositories.md)

### App (`routes/*` + `app/`)

- [Web routes & theme](./web/routes.md)

### Packages

- [Server-side layers (`duneta/http`, `duneta/worker`)](./packages/server.md)
- [Client-side layers (`duneta/*`)](./packages/client.md)
