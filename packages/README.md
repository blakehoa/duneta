# Packages

```text
packages/duneta            →  duneta (CLI + UI + Hono API, 1 package)
packages/create-duneta-app → create-duneta-app
```

Monorepo source nằm phẳng trong `packages/duneta/` — export path khớp trực tiếp tên thư mục (`duneta/views/component` → `packages/duneta/views/component`, `duneta/http` → `packages/duneta/http`, …).

| npm package | Import path | Dùng trong |
|-------------|-------------|------------|
| `duneta` | `duneta/*`, `duneta/http`, `duneta/middleware/http`, `duneta/middleware/page` | CLI + full-stack app |

## Tài liệu

- [`duneta` README](./duneta/README.md) · [`create-duneta-app` README](./create-duneta-app/README.md)
- [Client-side layers](../docs/packages/client.md) · [Server-side layers](../docs/packages/server.md)
- [Kiến trúc](../docs/architecture.md)
