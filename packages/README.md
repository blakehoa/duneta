# Packages

```text
packages/client       →  duneta-client (npm) · import duneta/client
packages/server       →  duneta-server (npm) · import duneta/server
packages/duneta       →  duneta (CLI; lúc publish copy client + server vào tarball)
packages/create-duneta-app → create-duneta-app
```

Monorepo chỉ có **một** source: `packages/client` và `packages/server`. Không có `packages/duneta/client` trong repo.

| npm package | Import path | Dùng trong |
|-------------|-------------|------------|
| `duneta-server` | `duneta/server` | `app/api/` |
| `duneta-client` | `duneta/client` | `app/` (web shell) |
| `duneta` | cả hai | CLI + full-stack app |

## Tài liệu

- [`duneta/server`](../docs/packages/server.md)
- [`duneta/client`](../docs/packages/client.md)
- [Kiến trúc](../docs/architecture.md)
