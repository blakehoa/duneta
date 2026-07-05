# Publishing Duneta to npm

## Packages

| Cài (`npm install`) | Import trong code | Mô tả |
|---------------------|-------------------|--------|
| `duneta` | `duneta/*`, `duneta/routes`, `duneta/http`, `duneta/middleware/http`, `duneta/middleware/page` | CLI + UI + Hono API, tất cả trong 1 package |
| `create-duneta-app` | — | Scaffold project mới |

**Lưu ý:** `duneta/routes`, `duneta/views/component`, `duneta/http`, `duneta/middleware/http`, v.v. là **import path** (khớp trực tiếp với thư mục trong `packages/duneta/`), không phải tên package npm riêng. Trên registry chỉ có `duneta` và `create-duneta-app`.

## User workflow (sau khi publish)

```bash
npx create-duneta-app my-app
cd my-app
npm run dev
```

```json
{
  "scripts": {
    "dev": "duneta dev",
    "build": "duneta build",
    "deploy": "duneta deploy"
  },
  "dependencies": {
    "duneta": "^0.1.2",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

Chỉ cần `duneta` — UI và API đã gộp sẵn trong package.

## Publish từ monorepo

```bash
pnpm --filter duneta run build
pnpm --filter duneta run verify:publish   # build + validate exports + npm pack --dry-run
pnpm version:sync 0.1.2
pnpm --filter duneta publish --access public
pnpm --filter create-duneta-app publish --access public
```

Thứ tự: **duneta → create-duneta-app**.

Source duy nhất là `packages/duneta` — build sinh `dist/` (gitignored), publish theo `files` trong `package.json`.

## Monorepo dev

```bash
pnpm install
pnpm build
pnpm dogfood
```
