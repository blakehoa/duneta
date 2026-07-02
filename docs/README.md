# Tài liệu Duneta

Monorepo TypeScript: **Hono API** (`duneta/server`) + **React Router web** (`duneta/client`).

## Mục lục

### Bắt đầu

- [Cài đặt & chạy dev](./getting-started.md)
- [Deploy Cloudflare Workers](./deployment.md)
- [Hướng dẫn customize](./customization.md)

### Kiến trúc

- [Tổng quan kiến trúc — ba lớp (core / build sẵn / user)](./architecture.md)
- [Cấu hình](./configuration.md)
- [Design system contract](../DESIGN.md)

### API (`app/api`)

- [Tổng quan API app](./api/overview.md)
- [Sync convention](./api/sync.md)
- [Runtime](./api/runtime.md)
- [Routes & `createAppRouter`](./api/routes.md)
- [Cron scheduled jobs](./api/cron.md)
- [Services & DI](./api/services.md)
- [Controller → Repository](./api/controllers-repositories.md)

### App (`app/`)

- [Web routes & theme](./web/routes.md)

### Packages

- [`duneta/server`](./packages/server.md)
- [`duneta/client`](./packages/client.md)
