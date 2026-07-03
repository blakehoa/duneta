# Publishing Duneta to npm

## Packages

| Cài (`npm install`) | Import trong code | Mô tả |
|---------------------|-------------------|--------|
| `duneta` | `duneta/client`, `duneta/server` | CLI + gộp client & server |
| `duneta-client` | `duneta/client` | Web kit (cài riêng) |
| `duneta-server` | `duneta/server` | Hono API (cài riêng) |
| `create-duneta-app` | — | Scaffold project mới |

**Lưu ý:** `duneta/client` và `duneta/server` là **import path** trong code, không phải tên package npm. Trên registry chỉ có `duneta`, `duneta-client`, `duneta-server`.

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

Chỉ cần `duneta` — client và server được gộp sẵn trong package.

### Cài riêng client hoặc server

```bash
npm install duneta-client
# hoặc
npm install duneta-server
```

Import vẫn dùng `duneta/client/...` hoặc `duneta/server/...` (Vite alias + `tsconfig` paths trong template hỗ trợ cả hai layout).

## Publish từ monorepo

```bash
pnpm --filter duneta-server run build
pnpm --filter duneta-client run build
pnpm version:sync 0.1.2
pnpm --filter duneta-server publish --access public
pnpm --filter duneta-client publish --access public
pnpm --filter duneta publish --access public
pnpm --filter create-duneta-app publish --access public
```

Thứ tự: **duneta-server → duneta-client → duneta → create-duneta-app**.

Package `duneta` copy `duneta-client` + `duneta-server` vào tarball lúc publish (`prepublishOnly`), không duplicate trong monorepo dev — source duy nhất là `packages/client` và `packages/server`.

## Monorepo dev

```bash
pnpm install
pnpm dev
```
