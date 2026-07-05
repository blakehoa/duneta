# duneta

Full-stack React + Hono on Cloudflare Workers — dev, build, and deploy CLI.

Install `duneta` to get the CLI plus the full `duneta/*` import surface (UI, router, config, Hono API toolkit, and middleware) in one package.

## Quick start

```bash
npx create-duneta-app my-app
cd my-app
npm install
npm run dev
```

## Install

```bash
npm install duneta
```

## Scripts

```json
{
  "scripts": {
    "dev": "duneta dev",
    "build": "duneta build",
    "deploy": "duneta deploy",
    "prepare": "duneta prepare"
  }
}
```

## Imports

| Path | Use in |
|------|--------|
| `duneta/views/*` | React Router web shell (`app/`) |
| `duneta/http` and `duneta/http/*` | Hono API (`routes/api.ts` + `app/http/controllers/`) |
| `duneta/middleware/http` | Hono/API middleware |
| `duneta/middleware/page` | React Router SSR page middleware |
| `duneta/vite` | Vite config re-export |

```ts
import { DunetaButton } from 'duneta/views/component';
import { defineServer } from 'duneta/worker';
```

## Requirements

- Node.js ≥ 22.22
- Cloudflare Workers (Wrangler)

## License

MIT
