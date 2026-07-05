# Cài đặt

## Deploy

```bash
pnpm install && pnpm deploy
```

`pnpm install` tự build framework packages. `pnpm deploy` sync + build app + `wrangler deploy`.

**Một lần:** Cloudflare auth:

```bash
wrangler login
```

App mới chỉ có `GET /api/health` — bật thêm trong `config/server.ts` khi cần.

Production bindings (optional): copy `wrangler.production.jsonc.example` (Hyperdrive, R2).

## Dev local

```bash
pnpm dev    # http://localhost:8787 — HMR (Vite + Workers runtime)
```

Tạo `.env` khi config dùng `process.env.*` (DB, auth, …). App minimal không bắt buộc file này. Sửa `pages/` hoặc component → trang tự cập nhật, không cần F5 hay `pnpm build`.

## Cấu trúc

| Path | Việc |
|------|------|
| `config/client.ts` | Web (theme, api) |
| `config/server.ts` | API (database, auth, …) |
| `wrangler.jsonc` | Worker dev |
| `worker.ts` | Entry Worker |
| `routes/api.ts` | API route registry (`ApiRoute.Config`) |
| `routes/web.ts` | Web route registry (`WebRoute.Config`) + page middleware |
| `app/http/controllers/` | API controllers and `ApiRoute.define` route groups |
| `app/pages/` | Pages React Router |
| `app/themes/` | CSS |

Thêm route mới trong `pages/` → restart `pnpm dev` (sync routers). Sửa file trong route đã có → HMR tự reload.

## CLI DX

```bash
pnpm duneta routes
pnpm duneta make:page dashboard
pnpm duneta make:controller post
pnpm duneta make:repository post
pnpm duneta make:route posts
pnpm duneta make:policy post
pnpm duneta make:middleware audit
pnpm duneta make:cron delete-user-session
```

`make:*` tạo file theo convention trong `app/`. Sau khi tạo, mount thủ công:

- Route group mới (`make:route`) → thêm export vào `routes/api.ts`
- Page mới (`make:page`) → thêm file trong `app/pages/` + `WebRoute.define` trong `routes/web.ts` nếu cần middleware
- Controller/repository mới → đăng ký trong `app/providers/app-service-provider.ts` (`registerServices`)
